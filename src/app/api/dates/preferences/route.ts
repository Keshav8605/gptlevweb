import { NextResponse } from "next/server";
import { getDatePreferences, updateDatePreference } from "@/lib/server-db";
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

    const preferences = getDatePreferences(access.role, giftId);
    return NextResponse.json({ success: true, preferences });
  } catch (err) {
    console.error("GET /api/dates/preferences error:", err);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
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

    const ideaId = typeof body?.ideaId === "string" ? body.ideaId : "";
    const updates = (body?.updates || {}) as Record<string, unknown>;

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
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

    const updated = updateDatePreference(ideaId, updates as unknown as Parameters<typeof updateDatePreference>[1], access.role, access.name);
    return NextResponse.json({ success: true, preference: updated });
  } catch (err) {
    console.error("POST /api/dates/preferences error:", err);
    return NextResponse.json({ error: "Failed to update preference" }, { status: 500 });
  }
}
