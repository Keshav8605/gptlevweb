import { NextResponse } from "next/server";
import { requireGiftAccess } from "@/lib/access-guard";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const giftId = url.searchParams.get("giftId");

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    return NextResponse.json({
      success: true,
      role: access.role,
      name: access.name,
      giftId: access.gift.id,
    });
  } catch (err) {
    console.error("GET /api/session error:", err);
    return NextResponse.json({ error: "Failed to resolve session" }, { status: 500 });
  }
}

