import { NextResponse } from "next/server";
import {
  getDateIdeas,
  addDateIdea,
  updateDateIdea,
  deleteDateIdea,
  getDatePreferences,
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

    const ideas = getDateIdeas(access.role === "creator");
    const preferences = getDatePreferences(access.role, giftId);

    return NextResponse.json({
      success: true,
      ideas,
      preferences,
    });
  } catch (err) {
    console.error("GET /api/dates/ideas error:", err);
    return NextResponse.json({ error: "Failed to fetch date ideas" }, { status: 500 });
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

    const title = typeof body?.title === "string" ? body.title : "";
    if (!title.trim()) {
      return NextResponse.json({ error: "Title is required for a date idea" }, { status: 400 });
    }

    const created = addDateIdea(body as unknown as Parameters<typeof addDateIdea>[0], access.role, access.name);
    return NextResponse.json({ success: true, idea: created });
  } catch (err) {
    console.error("POST /api/dates/ideas error:", err);
    return NextResponse.json({ error: "Failed to create date idea" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 });
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

    const updates = (body.updates || body) as unknown as Record<string, string>;
    const updated = updateDateIdea(id, updates, access.role);
    if (!updated) {
      return NextResponse.json({ error: "Unauthorized or idea not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true, idea: updated });
  } catch (err) {
    console.error("PUT /api/dates/ideas error:", err);
    return NextResponse.json({ error: "Failed to update date idea" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const giftId = url.searchParams.get("giftId");

    if (!id) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 });
    }

    if (!giftId) {
      return NextResponse.json({ error: "giftId parameter is required" }, { status: 400 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const ok = deleteDateIdea(id, access.role);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized or idea not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/dates/ideas error:", err);
    return NextResponse.json({ error: "Failed to delete date idea" }, { status: 500 });
  }
}
