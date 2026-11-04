import { NextResponse } from "next/server";
import { getGiftBySlug } from "@/lib/server-db";
import { getAuthenticatedCreator, createGiftUnlockToken } from "@/lib/auth-guard";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || url.searchParams.get("invite") || "";
    const passcode = url.searchParams.get("passcode") || "";

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
    if (gift.privacy.isPasswordProtected && !isOwner) {
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
          isPasswordProtected: gift.privacy.isPasswordProtected,
          invitationStatus: gift.privacy.invitationStatus,
          allowResponses: gift.privacy.allowResponses,
          allowRecipientContributions: gift.privacy.allowRecipientContributions,
        },
      };
      let unlockToken: string | undefined;
      try {
        unlockToken = createGiftUnlockToken(gift.id);
      } catch (tokenErr) {
        if (gift.privacy?.isPasswordProtected) {
          console.error("Failed to generate unlock token for password-protected gift:", tokenErr);
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
  } catch (err) {
    console.error("GET /api/gifts/by-slug/[slug] error:", err);
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}
