import { getGiftById, type GiftRecord } from "@/lib/server-db";
import { getAuthenticatedCreator, verifyGiftUnlockToken } from "@/lib/auth-guard";

export interface GiftAccessAuthorized {
  authorized: true;
  role: "creator" | "recipient";
  name: string;
  gift: GiftRecord;
}

export interface GiftAccessDenied {
  authorized: false;
  status: 400 | 401 | 403 | 404;
  error: string;
}

export type GiftAccessResult = GiftAccessAuthorized | GiftAccessDenied;

/**
 * Extracts a candidate unlock token from headers, authorization header, or URL query parameters.
 */
function extractUnlockToken(request: Request): string | null {
  const hToken =
    request.headers.get("x-gift-unlock-token") ||
    request.headers.get("x-unlock-token") ||
    request.headers.get("x-participant-token");

  if (hToken && hToken.trim()) {
    return hToken.trim();
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.trim().toLowerCase().startsWith("bearer ")) {
    const bearer = authHeader.trim().slice(7).trim();
    // Unlock tokens are dot-separated (giftId.exp.signature); exclude standard JWTs with 3 parts where part 0 is base64 header
    if (bearer && bearer.split(".").length === 3) {
      return bearer;
    }
  }

  try {
    const url = new URL(request.url);
    const qToken = url.searchParams.get("unlockToken") || url.searchParams.get("token");
    if (qToken && qToken.trim() && qToken.includes(".")) {
      return qToken.trim();
    }
  } catch {
    // Ignore URL parse errors
  }

  return null;
}

/**
 * Enforces verified gift access for collaborative endpoints.
 * Accepts:
 * (a) Verified creator JWT where gift.creatorId === auth.userId -> returns role "creator"
 * (b) Valid, unexpired HMAC unlock token bound to the gift -> returns role "recipient"
 *
 * If neither succeeds, returns 401 (no token provided) or 403 (token invalid or for another gift).
 * If giftId is missing, returns 400.
 */
export async function requireGiftAccess(
  request: Request,
  giftIdParam?: string | null
): Promise<GiftAccessResult> {
  const normalizedGiftId = (giftIdParam || "").trim();
  if (!normalizedGiftId) {
    return {
      authorized: false,
      status: 400,
      error: "giftId parameter is required",
    };
  }

  // 1. Run access check BEFORE looking up the gift
  const auth = await getAuthenticatedCreator(request);
  const unlockToken = extractUnlockToken(request);
  const unlockVerification = unlockToken
    ? verifyGiftUnlockToken(unlockToken, normalizedGiftId)
    : null;

  const hasCreatorAuth = Boolean(auth.authenticated && auth.userId);
  const hasValidUnlockToken = Boolean(unlockVerification && unlockVerification.valid);

  // If caller lacks valid creator auth or a valid unlock token bound to that giftId
  if (!hasCreatorAuth && !hasValidUnlockToken) {
    if (unlockToken && unlockVerification && !unlockVerification.valid) {
      return {
        authorized: false,
        status: 403,
        error: unlockVerification.error || "Forbidden. Invalid or expired gift unlock token.",
      };
    }

    return {
      authorized: false,
      status: 401,
      error: "Authentication required.",
    };
  }

  // 2. Caller has valid credentials. Now retrieve the gift.
  const gift = getGiftById(normalizedGiftId);
  if (!gift) {
    // Do not return 404 from collaborative routes
    return {
      authorized: false,
      status: 401,
      error: "Authentication required.",
    };
  }

  // 3. Authorized recipient via unlock token
  if (hasValidUnlockToken) {
    const recipientName = gift.recipientNickname || gift.recipientName || "Baby";
    return {
      authorized: true,
      role: "recipient",
      name: recipientName,
      gift,
    };
  }

  // 4. Authorized creator via JWT
  if (hasCreatorAuth) {
    if (gift.creatorId && gift.creatorId === auth.userId) {
      const creatorName = gift.senderName || gift.senderNickname || "Babe";
      return {
        authorized: true,
        role: "creator",
        name: creatorName,
        gift,
      };
    }

    return {
      authorized: false,
      status: 403,
      error: "Forbidden. You do not own this gift.",
    };
  }

  return {
    authorized: false,
    status: 401,
    error: "Authentication required.",
  };
}

