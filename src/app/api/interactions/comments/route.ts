import { NextResponse } from "next/server";
import { getComments, addComment, deleteComment } from "@/lib/server-db";
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

    const comments = getComments(targetType, targetId, giftId);
    return NextResponse.json({ success: true, comments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
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
    const content = typeof body?.content === "string" ? body.content : "";

    if (!targetType || !targetId || !content.trim()) {
      return NextResponse.json({ error: "Missing required fields or empty content" }, { status: 400 });
    }

    const comment = addComment(
      targetType as Parameters<typeof addComment>[0],
      targetId,
      content,
      access.role,
      access.name,
      giftId
    );

    return NextResponse.json({ success: true, comment });
  } catch {
    return NextResponse.json({ error: "Failed to add comment" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    let giftId = url.searchParams.get("giftId");

    if (!id) return NextResponse.json({ error: "Comment ID required" }, { status: 400 });

    if (!giftId) {
      const allComments = getComments();
      const match = allComments.find((c) => c.id === id);
      if (match?.giftId) {
        giftId = match.giftId;
      }
    }

    if (!giftId) {
      return NextResponse.json({ error: "giftId parameter is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const deleted = deleteComment(id, access.role, access.name);
    if (!deleted) {
      return NextResponse.json({ error: "Forbidden or comment not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 400 });
  }
}
