import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { verifyAccess } from "@/lib/server-db";
import type { GiftRecord } from "@/lib/server-db";

export interface CreatorAuthResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  isRecipient?: boolean;
  statusCode?: 401 | 403;
  error?: string;
}

export type AuthVerifierFn = (token: string) => Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
  error?: string;
}>;

let customAuthVerifier: AuthVerifierFn | null = null;

/**
 * Allows integration tests to provide a custom verifier for isolated authentication boundary testing.
 */
export function setAuthVerificationMock(verifier: AuthVerifierFn | null) {
  customAuthVerifier = verifier;
}

export function resetAuthVerificationMock() {
  customAuthVerifier = null;
}

function normalizeIssuer(rawUrl?: string): string {
  if (!rawUrl) return "";
  const cleaned = rawUrl.trim().replace(/\/+$/, "");
  if (cleaned.endsWith("/auth/v1")) return cleaned;
  return `${cleaned}/auth/v1`;
}

/**
 * Cryptographically verifies an HS256 JWT using a shared secret.
 * Validates header (HS256), cryptographic HMAC signature, issuer, audience, expiration, nbf, and subject.
 */
function verifyJwtCryptographically(
  token: string,
  secret: string,
  expectedIssuer?: string
): { valid: boolean; userId?: string; email?: string; error?: string } {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Malformed JWT: missing required segments." };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // 1. Validate Header and Algorithm
    let header: { alg?: string; typ?: string };
    try {
      header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
    } catch {
      return { valid: false, error: "Invalid JWT header format." };
    }

    if (!header || typeof header !== "object") {
      return { valid: false, error: "Invalid JWT header." };
    }

    const ALLOWED_LOCAL_ALGS = ["HS256"];
    if (!header.alg || !ALLOWED_LOCAL_ALGS.includes(header.alg)) {
      return { valid: false, error: `Unsupported or invalid signing algorithm: '${header.alg}'.` };
    }

    if (header.typ && header.typ !== "JWT") {
      return { valid: false, error: `Invalid token type: '${header.typ}'.` };
    }

    // 2. Cryptographic Signature Verification (constant-time comparison)
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    const sigBuffer = Buffer.from(signatureB64, "utf8");
    const expectedBuffer = Buffer.from(expectedSig, "utf8");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return { valid: false, error: "Cryptographic signature verification failed: invalid signature." };
    }

    // 3. Validate Claims
    let payload: {
      exp?: number;
      nbf?: number;
      aud?: string;
      iss?: string;
      sub?: string;
      email?: string;
      role?: string;
    };
    try {
      payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    } catch {
      return { valid: false, error: "Invalid JWT payload format." };
    }

    if (!payload || typeof payload !== "object") {
      return { valid: false, error: "Invalid JWT payload." };
    }

    const nowSec = Math.floor(Date.now() / 1000);

    // Expiration check: Reject tokens when exp <= currentTime
    if (!payload.exp || typeof payload.exp !== "number" || payload.exp <= nowSec) {
      return { valid: false, error: "Token has expired or missing expiration claim." };
    }

    // Not-Before check (nbf, if present)
    if (payload.nbf !== undefined) {
      if (typeof payload.nbf !== "number" || payload.nbf > nowSec) {
        return { valid: false, error: "Token is not yet valid: nbf claim is in the future." };
      }
    }

    // Audience check: REQUIRE aud === 'authenticated' (Do NOT accept role as substitute for invalid audience!)
    if (payload.aud !== "authenticated") {
      return { valid: false, error: "Invalid audience claim: expected 'authenticated'." };
    }

    // Issuer check: Missing issuer MUST be rejected
    if (!payload.iss || typeof payload.iss !== "string" || !payload.iss.trim()) {
      return { valid: false, error: "Missing required issuer (iss) claim." };
    }

    const targetExpectedIss = normalizeIssuer(
      expectedIssuer || process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    if (!targetExpectedIss) {
      return {
        valid: false,
        error: "Server configuration error: expected Supabase issuer cannot be established.",
      };
    }
    const normalizedPayloadIss = normalizeIssuer(payload.iss);
    if (normalizedPayloadIss !== targetExpectedIss) {
      return { valid: false, error: `Token issuer mismatch: expected '${targetExpectedIss}'.` };
    }

    // Subject identity check (mandatory sub)
    if (!payload.sub || typeof payload.sub !== "string" || !payload.sub.trim()) {
      return { valid: false, error: "Missing or invalid subject claim." };
    }

    return {
      valid: true,
      userId: payload.sub.trim(),
      email: typeof payload.email === "string" ? payload.email : undefined,
    };
  } catch {
    return { valid: false, error: "Token parsing or validation failed." };
  }
}

/**
 * Strictly authenticates a creator request:
 * 1. Rejects missing credentials with 401.
 * 2. Rejects recipient passcodes or invite tokens with 403.
 * 3. Never trusts unverified JWT payloads; enforces cryptographic verification.
 * 4. Extracts verified user ID strictly from Supabase Auth API or cryptographic verification.
 */
export async function getAuthenticatedCreator(request: Request): Promise<CreatorAuthResult> {
  const url = new URL(request.url);
  const authHeader = request.headers.get("authorization") || "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : "";

  const rawTokenParam = url.searchParams.get("token") || "";
  const isUnlockToken = rawTokenParam.split(".").length === 3 && !rawTokenParam.startsWith("eyJ");
  const effectiveTokenParam = isUnlockToken ? "" : rawTokenParam;

  const explicitToken =
    effectiveTokenParam ||
    url.searchParams.get("passcode") ||
    bearerToken;

  // 1. Inspect explicit token if supplied
  if (explicitToken) {
    // Check if it is a recipient token
    const accessCheck = verifyAccess(explicitToken);
    if (accessCheck.authorized && accessCheck.role === "recipient") {
      return {
        authenticated: false,
        isRecipient: true,
        statusCode: 403,
        error: "Forbidden. Recipient credentials cannot perform creator operations.",
      };
    }

    // If an isolated test verifier is registered (for offline regression tests)
    if (customAuthVerifier) {
      const mockResult = await customAuthVerifier(explicitToken);
      if (mockResult.valid && mockResult.userId) {
        return {
          authenticated: true,
          userId: mockResult.userId,
          email: mockResult.email,
        };
      }
      return {
        authenticated: false,
        statusCode: 401,
        error: mockResult.error || "Unauthorized. Token verification failed.",
      };
    }

    // Inspect JWT header algorithm if token follows standard 3-part structure
    const tokenParts = explicitToken.trim().split(".");
    if (tokenParts.length === 3) {
      let headerAlg = "";
      try {
        const header = JSON.parse(Buffer.from(tokenParts[0], "base64url").toString("utf8"));
        headerAlg = header.alg;
      } catch {
        return {
          authenticated: false,
          statusCode: 401,
          error: "Unauthorized. Malformed token header.",
        };
      }

      if (!headerAlg || headerAlg === "none") {
        return {
          authenticated: false,
          statusCode: 401,
          error: "Unauthorized. Unsigned tokens ('alg: none') are rejected.",
        };
      }

      const SUPPORTED_SUPABASE_ALGS = ["HS256", "RS256", "ES256"];
      if (!SUPPORTED_SUPABASE_ALGS.includes(headerAlg)) {
        return {
          authenticated: false,
          statusCode: 401,
          error: `Unauthorized. Unsupported signing algorithm: '${headerAlg}'.`,
        };
      }

      // If token uses HS256 and SUPABASE_JWT_SECRET is configured, perform local HMAC verification
      if (headerAlg === "HS256") {
        const jwtSecret = process.env.SUPABASE_JWT_SECRET;
        if (jwtSecret) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const expectedIss = normalizeIssuer(supabaseUrl);
          if (!expectedIss) {
            return {
              authenticated: false,
              statusCode: 401,
              error: "Unauthorized. Missing expected Supabase issuer configuration.",
            };
          }
          const cryptoResult = verifyJwtCryptographically(explicitToken, jwtSecret, expectedIss);

          if (cryptoResult.valid && cryptoResult.userId) {
            return {
              authenticated: true,
              userId: cryptoResult.userId,
              email: cryptoResult.email,
            };
          }

          return {
            authenticated: false,
            statusCode: 401,
            error: cryptoResult.error || "Unauthorized. Invalid creator credentials.",
          };
        }
      }
    }

    // For asymmetric algorithms (RS256/ES256) or when SUPABASE_JWT_SECRET is not configured locally,
    // verify through Supabase Server Client's trusted auth verification API.
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser(explicitToken);

      if (!error && data?.user?.id) {
        return {
          authenticated: true,
          userId: data.user.id,
          email: data.user.email,
        };
      }

      return {
        authenticated: false,
        statusCode: 401,
        error: error?.message || "Unauthorized. Invalid creator credentials.",
      };
    } catch {
      return {
        authenticated: false,
        statusCode: 401,
        error: "Unauthorized. Cryptographic authentication failed.",
      };
    }
  }

  // 2. Check Supabase server-side cookie session
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (!error && data?.user?.id) {
      return {
        authenticated: true,
        userId: data.user.id,
        email: data.user.email,
      };
    }
  } catch {
    // Session check failed or cookies absent
  }

  // 3. No valid credentials provided
  return {
    authenticated: false,
    statusCode: 401,
    error: "Authentication required. Verified creator credentials must be provided.",
  };
}

/**
 * Checks whether an authenticated creator owns a specific gift record.
 */
export function checkGiftOwnership(gift: GiftRecord, authenticatedUserId: string): boolean {
  if (!authenticatedUserId) return false;
  // A creator owns the gift if gift.creatorId strictly matches their authenticated user ID
  if (gift.creatorId) {
    return gift.creatorId === authenticatedUserId;
  }
  // Legacy gifts with missing creatorId cannot be owned by arbitrary users
  return false;
}

export const MAX_UNLOCK_TOKEN_LIFETIME_SECONDS = 7 * 24 * 60 * 60; // 7 days maximum lifetime

/**
 * Retrieves the dedicated server-side unlock secret from the environment.
 * Requires GIFT_UNLOCK_SECRET to be configured (fails closed if missing or empty).
 * Never exposes the secret or falls back to a hardcoded string.
 */
export function getGiftUnlockSecret(): string | null {
  const secret = process.env.GIFT_UNLOCK_SECRET;
  if (!secret || typeof secret !== "string" || !secret.trim()) {
    return null;
  }
  return secret.trim();
}

/**
 * Creates an HMAC-SHA256 signed unlock token bound to a specific gift.
 * Format: <giftId>.<expiresAtSec>.<signature>
 *
 * @throws Error if GIFT_UNLOCK_SECRET is not configured or expiresInSeconds is invalid.
 */
export function createGiftUnlockToken(
  giftId: string,
  expiresInSeconds: number = 2 * 60 * 60 // 2 hours default
): string {
  if (!giftId || typeof giftId !== "string" || !giftId.trim()) {
    throw new Error("Invalid giftId: giftId is required to generate an unlock token.");
  }

  const secret = getGiftUnlockSecret();
  if (!secret) {
    throw new Error("Server configuration error: GIFT_UNLOCK_SECRET environment variable is missing or empty.");
  }

  if (
    !Number.isSafeInteger(expiresInSeconds) ||
    expiresInSeconds <= 0 ||
    expiresInSeconds > MAX_UNLOCK_TOKEN_LIFETIME_SECONDS
  ) {
    throw new Error(
      `Invalid token lifetime: expiresInSeconds must be a safe integer between 1 and ${MAX_UNLOCK_TOKEN_LIFETIME_SECONDS} seconds.`
    );
  }

  const expiresAtSec = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const payload = `${giftId.trim()}.${expiresAtSec}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Cryptographically verifies that an unlock token is valid, unexpired, and bound to the expected gift.
 *
 * Fails closed if:
 * - GIFT_UNLOCK_SECRET is not configured
 * - Token is missing, malformed, or has non-digit expiration
 * - Token expiration is less than or equal to current time (expiresAtSec <= nowSec)
 * - Token lifetime exceeds maximum allowed duration
 * - Token was issued for a different gift ID
 * - Signature does not match (using constant-time comparison)
 */
export function verifyGiftUnlockToken(
  token: string,
  expectedGiftId: string
): { valid: boolean; error?: string } {
  const secret = getGiftUnlockSecret();
  if (!secret) {
    return {
      valid: false,
      error: "Server configuration error: GIFT_UNLOCK_SECRET environment variable is missing or empty.",
    };
  }

  if (!token || typeof token !== "string" || !token.trim()) {
    return { valid: false, error: "Missing unlock authorization token." };
  }

  const trimmedToken = token.trim();
  const parts = trimmedToken.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed unlock authorization token: expected 3 dot-separated parts." };
  }

  const [tokenGiftId, expiresAtStr, signature] = parts;

  // 1. Gift binding: ensure token was issued specifically for this gift
  if (!tokenGiftId || tokenGiftId !== expectedGiftId) {
    return {
      valid: false,
      error: "Forbidden. Unlock authorization token is not valid for this gift.",
    };
  }

  // 2. Expiration format: require expiration segment to contain only decimal digits
  if (!/^\d+$/.test(expiresAtStr)) {
    return {
      valid: false,
      error: "Malformed unlock authorization token: expiration must contain only decimal digits.",
    };
  }

  const expiresAtSec = parseInt(expiresAtStr, 10);
  if (!Number.isSafeInteger(expiresAtSec)) {
    return {
      valid: false,
      error: "Malformed unlock authorization token: expiration integer out of bounds.",
    };
  }

  const nowSec = Math.floor(Date.now() / 1000);

  // 3. Reject expiration when expiresAtSec <= nowSec (exact boundary rejected)
  if (expiresAtSec <= nowSec) {
    return { valid: false, error: "Unlock authorization token has expired." };
  }

  // 4. Enforce reasonable maximum token lifetime from current time
  if (expiresAtSec - nowSec > MAX_UNLOCK_TOKEN_LIFETIME_SECONDS) {
    return {
      valid: false,
      error: "Unlock authorization token exceeds maximum allowed lifetime.",
    };
  }

  // 5. Cryptographic signature check (constant-time comparison)
  if (!signature || !/^[A-Za-z0-9_-]+$/.test(signature)) {
    return { valid: false, error: "Malformed unlock authorization token signature." };
  }

  const payload = `${tokenGiftId}.${expiresAtStr}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature, "utf8");
  const expBuffer = Buffer.from(expectedSig, "utf8");

  if (
    sigBuffer.length !== expBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expBuffer)
  ) {
    return { valid: false, error: "Invalid unlock authorization token signature." };
  }

  return { valid: true };
}
