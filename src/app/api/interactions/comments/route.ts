import { NextResponse } from "next/server";
import { getComments, addComment, deleteComment, verifyAccess } from "@/lib/server-db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetType = url.searchParams.get("targetType") || undefined;
  const targetId = url.searchParams.get("targetId") || undefined;

  const comments = getComments(targetType, targetId);
  return NextResponse.json({ success: true, comments });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const auth = verifyAccess(token);

    const role = auth.authorized ? auth.role : (body.role || "recipient");
    const name = auth.authorized ? auth.name : (body.name || (role === "creator" ? "Babe" : "Baby"));

    if (!body.targetType || !body.targetId || !body.content?.trim()) {
      return NextResponse.json({ error: "Missing required fields or empty content" }, { status: 400 });
    }

    const comment = addComment(
      body.targetType,
      body.targetId,
      body.content,
      role as "creator" | "recipient",
      name
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
    const token = url.searchParams.get("token") || "";

    if (!id) return NextResponse.json({ error: "Comment ID required" }, { status: 400 });

    const auth = verifyAccess(token);
    const role = auth.authorized ? auth.role : "recipient";

    const deleted = deleteComment(id, role as "creator" | "recipient");
    if (!deleted) {
      return NextResponse.json({ error: "Forbidden or comment not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 400 });
  }
}
