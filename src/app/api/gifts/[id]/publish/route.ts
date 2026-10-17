import { NextResponse } from "next/server";
import { publishGift, verifyAccess } from "@/lib/server-db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { publish, status, token } = body;
    const isPublish = publish !== undefined ? !!publish : status === "published";

    if (token) {
      const auth = verifyAccess(token);
      if (!auth.authorized || auth.role !== "creator") {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
    }

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
