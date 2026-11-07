import { NextResponse } from "next/server";
import { getReactions, toggleReaction } from "@/lib/server-db";
import { requireGiftAccess } from "@/lib/access-guard";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const giftId = url.searchParams.get("giftId");
    if (!giftId) {
      return NextResponse.json({ error: "giftId parameter is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const targetType = url.searchParams.get("targetType") || undefined;
    const targetId = url.searchParams.get("targetId") || undefined;

    const reactions = getReactions(targetType, targetId, giftId);
    return NextResponse.json({ success: true, reactions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const url = new URL(request.url);
    const giftId = (typeof body?.giftId === "string" ? body.giftId : null) || url.searchParams.get("giftId");
    if (!giftId) {
      return NextResponse.json({ error: "giftId is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const targetType = typeof body?.targetType === "string" ? body.targetType : "";
    const targetId = typeof body?.targetId === "string" ? body.targetId : "";
    const emoji = typeof body?.emoji === "string" ? body.emoji : "";

    if (!targetType || !targetId || !emoji) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = toggleReaction(
      targetType as Parameters<typeof toggleReaction>[0],
      targetId,
      emoji,
      access.role,
      access.name,
      giftId
    );

    return NextResponse.json({ success: true, reactions: updated });
  } catch {
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 400 });
  }
}
