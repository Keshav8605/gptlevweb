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

    // If verified creator, return only gifts where creatorId === auth.userId
    if (auth.authenticated && auth.userId) {
      const creatorGifts = getGifts(auth.userId).filter((g) => g.creatorId === auth.userId);
      return NextResponse.json({ success: true, gifts: creatorGifts });
    }

    // Public / unauthenticated visitors only see the public demo gift with safe fields only (id, title, slug)
    const demoGift = getGiftById("gift_world_demo");
    const safeDemoGifts = demoGift
      ? [{ id: demoGift.id, title: demoGift.title, slug: demoGift.slug }]
      : [];

    return NextResponse.json({ success: true, gifts: safeDemoGifts });
  } catch (err) {
    console.error("GET /api/gifts error:", err);
    return NextResponse.json({ error: "Failed to fetch gifts" }, { status: 500 });
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
        return NextResponse.json({ error: "Source gift not found for duplication" }, { status: 404 });
      }

      // If source gift is unpublished, require creator ownership to duplicate
      if (sourceGift.status !== "published") {
        if (!sourceGift.creatorId || sourceGift.creatorId !== auth.userId) {
          return NextResponse.json(
            { error: "Forbidden. Cannot duplicate unpublished draft belonging to another creator." },
            { status: 403 }
          );
        }
      }

      const duplicated = duplicateGift(targetSourceId, auth.userId);
      if (!duplicated) {
        return NextResponse.json({ error: "Failed to duplicate gift" }, { status: 500 });
      }

      return NextResponse.json({ success: true, gift: duplicated });
    }

    // 3. Create fresh gift strictly bound to verified creator
    const created = createGift(giftData, auth.userId);
    const rawInviteToken = created.rawInviteToken;

    // Sanitize gift so hashes are stripped from the response
    const safeGift = {
      ...created,
      rawInviteToken: undefined,
      privacy: {
        ...created.privacy,
        recipientInviteToken: undefined,
        passcode: undefined,
      },
    };

    return NextResponse.json({
      success: true,
      gift: safeGift,
      rawInviteToken,
    });
  } catch (err) {
    console.error("POST /api/gifts error:", err);
    return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
  }
}
