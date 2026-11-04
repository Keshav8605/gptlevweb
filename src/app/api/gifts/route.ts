import { NextResponse } from "next/server";
import { getGifts, createGift, duplicateGift, getGiftById } from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedCreator(request);

    // If caller provided a recipient token, forbid creator gift listing
    if (auth.isRecipient) {
      return NextResponse.json(
        { error: "Forbidden. Recipient tokens cannot list creator gifts." },
        { status: 403 }
      );
    }

    // If verified creator, list their gifts (and the public demo gift)
    if (auth.authenticated && auth.userId) {
      const creatorGifts = getGifts(auth.userId);
      return NextResponse.json({ success: true, gifts: creatorGifts });
    }

    // Public / unauthenticated visitors only see published gifts, fully sanitized
    const publicGifts = getGifts()
      .filter((g) => g.status === "published")
      .map((g) => ({
        ...g,
        secretPassword: undefined,
        secretContent: undefined,
        privacy: {
          isPasswordProtected: g.privacy.isPasswordProtected,
          invitationStatus: g.privacy.invitationStatus,
          allowResponses: g.privacy.allowResponses,
          allowRecipientContributions: g.privacy.allowRecipientContributions,
        },
      }));

    return NextResponse.json({ success: true, gifts: publicGifts });
  } catch (err) {
    console.error("GET /api/gifts error:", err);
    return NextResponse.json({ error: "Failed to list gifts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Enforce verified creator authentication
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Authentication required. Creator credentials must be provided." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const { duplicateId, sourceGiftId, ...giftData } = body;
    const targetSourceId = duplicateId || sourceGiftId;

    // 2. Handle duplication with ownership validation
    if (targetSourceId) {
      const sourceGift = getGiftById(targetSourceId);
      if (!sourceGift) {
        return NextResponse.json({ error: "Gift to duplicate not found" }, { status: 404 });
      }

      // For every unpublished gift, only the actual owner may duplicate it.
      // Reject duplication when creatorId is missing or does not match the authenticated creator.
      if (sourceGift.status !== "published") {
        if (!sourceGift.creatorId || sourceGift.creatorId !== auth.userId) {
          return NextResponse.json(
            { error: "Forbidden. Only the owner may duplicate an unpublished gift." },
            { status: 403 }
          );
        }
      }

      const cloned = duplicateGift(targetSourceId, auth.userId);
      if (!cloned) {
        return NextResponse.json({ error: "Failed to duplicate gift" }, { status: 500 });
      }
      return NextResponse.json({ success: true, gift: cloned });
    }

    // 3. Create new gift bound to authenticated creator ID
    const created = createGift(giftData, auth.userId);
    return NextResponse.json({ success: true, gift: created });
  } catch (err) {
    console.error("POST /api/gifts error:", err);
    return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
  }
}
