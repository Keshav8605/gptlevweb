import { NextResponse } from "next/server";
import { publishGift, getGiftById } from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Enforce verified creator authentication
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Authentication required. Creator credentials must be provided." },
        { status: auth.statusCode || 401 }
      );
    }

    // 2. Verify gift exists
    const gift = getGiftById(id);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    // 3. Verify gift ownership
    if (gift.creatorId && gift.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to publish or unpublish this gift." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { publish, status } = body;
    const isPublish = publish !== undefined ? !!publish : status === "published";

    const result = publishGift(id, isPublish);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Publishing failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, gift: result.gift });
  } catch (err) {
    console.error("POST /api/gifts/[id]/publish error:", err);
    return NextResponse.json({ error: "Failed to update publication status" }, { status: 500 });
  }
}
