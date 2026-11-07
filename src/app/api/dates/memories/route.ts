import { NextResponse } from "next/server";
import {
  getDateMemories,
  addDateMemory,
  deleteDateMemory,
} from "@/lib/server-db";
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

    const memories = getDateMemories(giftId);
    return NextResponse.json({ success: true, memories });
  } catch (err) {
    console.error("GET /api/dates/memories error:", err);
    return NextResponse.json({ error: "Failed to fetch date memories" }, { status: 500 });
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

    const dateTitle = typeof body?.dateTitle === "string" ? body.dateTitle : "";
    if (!dateTitle.trim()) {
      return NextResponse.json({ error: "Date title is required" }, { status: 400 });
    }

    const created = addDateMemory({ ...(body as unknown as Record<string, string>), giftId }, access.role, access.name);
    return NextResponse.json({ success: true, memory: created });
  } catch (err) {
    console.error("POST /api/dates/memories error:", err);
    return NextResponse.json({ error: "Failed to create date memory" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    let giftId = url.searchParams.get("giftId");

    if (!id) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 });
    }

    if (!giftId) {
      const allMemories = getDateMemories();
      const match = allMemories.find((m) => m.id === id);
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

    const ok = deleteDateMemory(id, access.role, access.name);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized or memory not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/dates/memories error:", err);
    return NextResponse.json({ error: "Failed to delete date memory" }, { status: 500 });
  }
}
