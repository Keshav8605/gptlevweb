import { NextResponse } from "next/server";
import { getGiftBySlug } from "@/lib/server-db";
import { getAuthenticatedCreator, createGiftUnlockToken } from "@/lib/auth-guard";
import { verifyPasscode, verifyInviteToken } from "@/lib/secrets";

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

    const inviteCheck = Boolean(token) && verifyInviteToken(token, gift.privacy?.recipientInviteToken);
    const isRecipient =
      Boolean(inviteCheck && inviteCheck.valid) &&
      gift.privacy?.invitationStatus === "active";

    const isDemoGift = gift.id === "gift_world_demo";

    const passcodeCheck =
      Boolean(passcode) &&
      Boolean(gift.privacy?.passcode) &&
      verifyPasscode(passcode, gift.privacy?.passcode);
    const isPasscodeUnlocked = Boolean(passcodeCheck && passcodeCheck.valid);

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

    // 2. Lock check:
    // Policy change: for every gift except gift_world_demo, GET /api/gifts/by-slug/[slug]
    // must return isLocked: true (title and recipientNickname only) unless the caller presents:
    // - a valid passcode for this specific gift,
    // - a valid invite token for this specific gift, or
    // - is the owning creator.
    // This applies even when privacy.isPasswordProtected is false.
    if (!isDemoGift && !isOwner && !isRecipient && !isPasscodeUnlocked) {
      return NextResponse.json({
        success: true,
        isLocked: true,
        giftId: gift.id,
        title: gift.title,
        recipientNickname: gift.recipientNickname,
      });
    }

    // Demo gift password-protection check (if demo was configured with a passcode)
    if (isDemoGift && gift.privacy?.isPasswordProtected && !isOwner && !isRecipient && !isPasscodeUnlocked) {
      return NextResponse.json({
        success: true,
        isLocked: true,
        giftId: gift.id,
        title: gift.title,
        recipientNickname: gift.recipientNickname,
      });
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

      const hasRecipientCredentials = isRecipient || isPasscodeUnlocked;

      // For anonymous callers on the demo gift (unprotected demo preview):
      // Keep demo open (gift content returned), but do NOT issue an unlockToken or recipient role.
      // Collaborative writes remain rejected for anonymous visitors.
      if (!hasRecipientCredentials && isDemoGift) {
        return NextResponse.json({
          success: true,
          gift: sanitizedGift,
          role: "guest",
          name: "Guest",
        });
      }

      let unlockToken: string | undefined;
      try {
        unlockToken = createGiftUnlockToken(gift.id);
      } catch {
        console.error("Failed to generate unlock token.");
        return NextResponse.json(
          { error: "Server configuration error: unable to generate unlock authorization." },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        gift: sanitizedGift,
        unlockToken,
        role: "recipient",
        name: gift.recipientNickname || gift.recipientName || "Baby",
      });
    }

    // Safe owner view: never expose raw passcodes or hashes
    const sanitizedOwnerGift = {
      ...gift,
      secretPassword: undefined,
      privacy: {
        ...gift.privacy,
        passcode: undefined,
        recipientInviteToken: undefined,
      },
    };

    let unlockToken: string | undefined;
    try {
      unlockToken = createGiftUnlockToken(gift.id);
    } catch {
      // Non-blocking for owner view
    }
    return NextResponse.json({
      success: true,
      gift: sanitizedOwnerGift,
      unlockToken,
      role: "creator",
      name: gift.senderName || gift.senderNickname || "Babe",
    });
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
