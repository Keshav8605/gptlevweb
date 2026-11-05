import { NextResponse } from "next/server";
import { getGiftBySlug } from "@/lib/server-db";
import { getAuthenticatedCreator, createGiftUnlockToken } from "@/lib/auth-guard";

/**
 * Extracts gift access credentials with secure header priority:
 * 1. HTTP Headers: x-gift-passcode / x-passcode, x-invitation-token / x-invite-token
 * 2. POST JSON Body: { passcode, token }
 * 3. Query string fallback: ?passcode=, ?token=, ?invite= (backward compatibility)
 * Never logs credentials.
 */
async function extractCredentials(request: Request): Promise<{ passcode: string; token: string }> {
  let passcode =
    request.headers.get("x-gift-passcode") ||
    request.headers.get("x-passcode") ||
    "";
  let token =
    request.headers.get("x-invitation-token") ||
    request.headers.get("x-invite-token") ||
    "";

  if (request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.clone().json();
        if (body && typeof body === "object" && !Array.isArray(body)) {
          const rec = body as Record<string, unknown>;
          if (!passcode && typeof rec.passcode === "string") {
            passcode = rec.passcode;
          }
          if (!token && typeof rec.token === "string") {
            token = rec.token;
          }
          if (!token && typeof rec.invite === "string") {
            token = rec.invite;
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in body
    }
  }

  if (!passcode || !token) {
    try {
      const url = new URL(request.url);
      if (!passcode) {
        passcode = url.searchParams.get("passcode") || "";
      }
      if (!token) {
        token =
          url.searchParams.get("token") ||
          url.searchParams.get("invite") ||
          url.searchParams.get("inviteToken") ||
          "";
      }
    } catch {
      // Ignore URL parse errors
    }
  }

  return { passcode, token };
}

async function handleGiftAccessBySlug(
  request: Request,
  slug: string
): Promise<NextResponse> {
  try {
    const { passcode, token } = await extractCredentials(request);

    const gift = getGiftBySlug(slug);
    if (!gift) {
      return NextResponse.json({ error: "Romantic gift not found" }, { status: 404 });
    }

    const auth = await getAuthenticatedCreator(request);
    const isOwner =
      auth.authenticated &&
      Boolean(auth.userId) &&
      Boolean(gift.creatorId) &&
      gift.creatorId === auth.userId;

    const isRecipient =
      Boolean(token) &&
      token === gift.privacy?.recipientInviteToken &&
      gift.privacy?.invitationStatus === "active";

    // 1. Enforce strict draft authorization:
    // A passcode alone must NEVER authorize access to an unpublished draft.
    // Only the verified creator owner or an active recipient with invitation token can view.
    if (gift.status !== "published") {
      if (!isOwner && !isRecipient) {
        return NextResponse.json(
          {
            error: "This gift is currently in draft mode and has not been published yet.",
            status: gift.status,
          },
          { status: 403 }
        );
      }
    }

    // 2. Check password protection for published gifts (or non-owners)
    if (gift.privacy?.isPasswordProtected && !isOwner) {
      const isPasscodeUnlocked = Boolean(passcode) && passcode === gift.privacy.passcode;
      if (!isPasscodeUnlocked && !isRecipient) {
        return NextResponse.json({
          success: true,
          isLocked: true,
          giftId: gift.id,
          title: gift.title,
          recipientNickname: gift.recipientNickname,
        });
      }
    }

    // 3. If caller is not verified owner, sanitize sensitive creator secrets and tokens
    if (!isOwner) {
      const sanitizedGift = {
        ...gift,
        secretPassword: undefined,
        secretContent: undefined, // Must be unlocked via /api/secret/verify
        privacy: {
          isPasswordProtected: gift.privacy?.isPasswordProtected ?? false,
          invitationStatus: gift.privacy?.invitationStatus ?? "active",
          allowResponses: gift.privacy?.allowResponses ?? true,
          allowRecipientContributions: gift.privacy?.allowRecipientContributions ?? true,
        },
      };
      let unlockToken: string | undefined;
      try {
        unlockToken = createGiftUnlockToken(gift.id);
      } catch (tokenErr) {
        if (gift.privacy?.isPasswordProtected) {
          console.error("Failed to generate unlock token for password-protected gift.");
          return NextResponse.json(
            { error: "Server configuration error: unable to generate unlock authorization." },
            { status: 500 }
          );
        }
      }
      return NextResponse.json({ success: true, gift: sanitizedGift, unlockToken });
    }

    let unlockToken: string | undefined;
    try {
      unlockToken = createGiftUnlockToken(gift.id);
    } catch {
      // Non-blocking for owner view
    }
    return NextResponse.json({ success: true, gift, unlockToken });
  } catch {
    console.error("Failed to process gift request by slug.");
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  return handleGiftAccessBySlug(request, slug);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  return handleGiftAccessBySlug(request, slug);
}
