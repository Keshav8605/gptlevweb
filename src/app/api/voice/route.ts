import { NextResponse } from "next/server";
import { getVoiceMessages, addVoiceMessage, deleteVoiceMessage, verifyAccess } from "@/lib/server-db";

export async function GET() {
  const messages = getVoiceMessages();
  return NextResponse.json({ success: true, messages });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const auth = verifyAccess(token);

    const role = auth.authorized ? auth.role : (body.role || "recipient");
    const name = auth.authorized ? auth.name : (body.name || (role === "creator" ? "Babe" : "Baby"));

    if (!body.audioData) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    const message = addVoiceMessage(
      body.audioData,
      body.durationSeconds || 5,
      role as "creator" | "recipient",
      name
    );

    return NextResponse.json({ success: true, message });
  } catch {
    return NextResponse.json({ error: "Failed to upload voice message" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("token") || "";

    if (!id) return NextResponse.json({ error: "Voice message ID required" }, { status: 400 });

    const auth = verifyAccess(token);
    const role = auth.authorized ? auth.role : "recipient";

    const deleted = deleteVoiceMessage(id, role as "creator" | "recipient");
    if (!deleted) {
      return NextResponse.json({ error: "Unauthorized or message not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete voice message" }, { status: 400 });
  }
}
