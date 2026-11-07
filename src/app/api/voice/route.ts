import { NextResponse } from "next/server";
import { getVoiceMessages, addVoiceMessage, deleteVoiceMessage } from "@/lib/server-db";
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

    const messages = getVoiceMessages(giftId);
    return NextResponse.json({ success: true, messages });
  } catch {
    return NextResponse.json({ error: "Failed to fetch voice messages" }, { status: 500 });
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

    const audioData = typeof body?.audioData === "string" ? body.audioData : "";
    if (!audioData) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    const durationSeconds = typeof body?.durationSeconds === "number" ? body.durationSeconds : 5;

    const message = addVoiceMessage(
      audioData,
      durationSeconds,
      access.role,
      access.name,
      giftId
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
    let giftId = url.searchParams.get("giftId");

    if (!id) {
      return NextResponse.json({ error: "Voice message ID required" }, { status: 400 });
    }

    if (!giftId) {
      const messages = getVoiceMessages();
      const match = messages.find((m) => m.id === id);
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

    const deleted = deleteVoiceMessage(id, access.role, access.name);
    if (!deleted) {
      return NextResponse.json({ error: "Unauthorized or message not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete voice message" }, { status: 400 });
  }
}
