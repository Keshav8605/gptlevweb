import { NextResponse } from "next/server";
import { getGiftById, updateGift, deleteGift, verifyAccess } from "@/lib/server-db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const gift = getGiftById(id);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, gift });
  } catch (err) {
    console.error("GET /api/gifts/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { token, ...updates } = body;

    if (token) {
      const auth = verifyAccess(token);
      if (!auth.authorized || auth.role !== "creator") {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
    }

    const updated = updateGift(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, gift: updated });
  } catch (err) {
    console.error("PUT /api/gifts/[id] error:", err);
    return NextResponse.json({ error: "Failed to update gift" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";

    if (token) {
      const auth = verifyAccess(token);
      if (!auth.authorized || auth.role !== "creator") {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
    }

    const ok = deleteGift(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Cannot delete this gift. At least one gift must remain." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/gifts/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete gift" }, { status: 500 });
  }
}
