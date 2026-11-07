import { NextResponse } from "next/server";
import {
  getDateNotifications,
  markNotificationsAsRead,
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

    const notifications = getDateNotifications(access.role, giftId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error("GET /api/dates/notifications error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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

    const ids = Array.isArray(body?.ids) ? (body.ids as string[]) : "all";
    markNotificationsAsRead(ids, access.role);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/dates/notifications error:", err);
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 });
  }
}
