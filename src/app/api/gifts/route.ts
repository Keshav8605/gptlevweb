import { NextResponse } from "next/server";
import { getGifts, createGift, duplicateGift, verifyAccess } from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";

    // Creator auth check
    if (token) {
      const auth = verifyAccess(token);
      if (!auth.authorized || auth.role !== "creator") {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
    }

    const gifts = getGifts();
    return NextResponse.json({ success: true, gifts });
  } catch (err) {
    console.error("GET /api/gifts error:", err);
    return NextResponse.json({ error: "Failed to list gifts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, duplicateId, sourceGiftId, ...giftData } = body;
    const targetSourceId = duplicateId || sourceGiftId;

    if (token) {
      const auth = verifyAccess(token);
      if (!auth.authorized || auth.role !== "creator") {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
    }

    if (targetSourceId) {
      const cloned = duplicateGift(targetSourceId);
      if (!cloned) {
        return NextResponse.json({ error: "Gift to duplicate not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, gift: cloned });
    }

    const created = createGift(giftData);
    return NextResponse.json({ success: true, gift: created });
  } catch (err) {
    console.error("POST /api/gifts error:", err);
    return NextResponse.json({ error: "Failed to create gift" }, { status: 500 });
  }
}
