import { NextResponse } from "next/server";
import { getReactions, toggleReaction, verifyAccess } from "@/lib/server-db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetType = url.searchParams.get("targetType") || undefined;
  const targetId = url.searchParams.get("targetId") || undefined;

  const reactions = getReactions(targetType, targetId);
  return NextResponse.json({ success: true, reactions });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const auth = verifyAccess(token);

    // Default to recipient if demo token provided or in public view
    const role = auth.authorized ? auth.role : (body.role || "recipient");
    const name = auth.authorized ? auth.name : (body.name || (role === "creator" ? "Babe" : "Baby"));

    if (!body.targetType || !body.targetId || !body.emoji) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = toggleReaction(
      body.targetType,
      body.targetId,
      body.emoji,
      role as "creator" | "recipient",
      name
    );

    return NextResponse.json({ success: true, reactions: updated });
  } catch {
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 400 });
  }
}
