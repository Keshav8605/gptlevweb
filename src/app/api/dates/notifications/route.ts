import { NextResponse } from "next/server";
import {
  getDateNotifications,
  markNotificationsAsRead,
  verifyAccess,
} from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const roleParam = url.searchParams.get("role") || "recipient";

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam as "creator" | "recipient" };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";

    const notifications = getDateNotifications(role);
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error("GET /api/dates/notifications error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ids, token, role: roleParam } = body;

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam || "recipient" };
    const role = (auth.authorized ? auth.role : (roleParam || "recipient")) as "creator" | "recipient";

    markNotificationsAsRead(ids || "all", role);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/dates/notifications error:", err);
    return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 });
  }
}
