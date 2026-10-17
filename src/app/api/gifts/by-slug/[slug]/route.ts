import { NextResponse } from "next/server";
import { getGiftBySlug } from "@/lib/server-db";

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

    // If gift is not published, only authorized token or passcode can view
    if (gift.status !== "published") {
      const isCreatorPasscode = passcode === gift.privacy.passcode;
      const isRecipientToken = token === gift.privacy.recipientInviteToken;
      if (!isCreatorPasscode && !isRecipientToken) {
        return NextResponse.json(
          {
            error: "This gift is currently in draft mode and has not been published yet.",
            status: gift.status,
          },
          { status: 403 }
        );
      }
    }

    // Check password protection
    if (gift.privacy.isPasswordProtected) {
      const isCreator = passcode === gift.privacy.passcode;
      const isRecipient = token === gift.privacy.recipientInviteToken;
      if (!isCreator && !isRecipient) {
        return NextResponse.json({
          success: true,
          isLocked: true,
          giftId: gift.id,
          title: gift.title,
          recipientNickname: gift.recipientNickname,
        });
      }
    }

    // Sanitize sensitive creator secrets from recipient payload
    const sanitizedGift = {
      ...gift,
      secretPassword: undefined,
      secretContent: undefined, // Must be unlocked via /api/secret/verify
      privacy: {
        ...gift.privacy,
        passcode: undefined, // Do not expose plaintext passcode
      },
    };

    return NextResponse.json({ success: true, gift: sanitizedGift });
  } catch (err) {
    console.error("GET /api/gifts/by-slug/[slug] error:", err);
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}
