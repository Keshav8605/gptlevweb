import { NextResponse } from "next/server";
import { getMediaAssets, deleteMediaAsset, verifyAccess } from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const giftId = url.searchParams.get("giftId") || undefined;
    const assets = getMediaAssets(giftId);
    return NextResponse.json({ success: true, assets });
  } catch (err) {
    console.error("GET /api/media error:", err);
    return NextResponse.json({ error: "Failed to list media assets" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("token") || "";

    if (!id) {
      return NextResponse.json({ error: "Media asset ID required" }, { status: 400 });
    }

    if (token) {
      const auth = verifyAccess(token);
      if (!auth.authorized || auth.role !== "creator") {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
    }

    const ok = deleteMediaAsset(id);
    if (!ok) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/media error:", err);
    return NextResponse.json({ error: "Failed to delete media asset" }, { status: 500 });
  }
}
