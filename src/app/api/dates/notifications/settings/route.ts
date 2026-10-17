import { NextResponse } from "next/server";
import { getNotificationSettings, updateNotificationSettings } from "@/lib/server-db";

export async function GET() {
  try {
    const settings = getNotificationSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("GET /api/dates/notifications/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = updateNotificationSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("POST /api/dates/notifications/settings error:", err);
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}
