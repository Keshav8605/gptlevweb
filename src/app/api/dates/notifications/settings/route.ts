import { NextResponse } from "next/server";
import { getNotificationSettings, updateNotificationSettings, NotificationSettings } from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const settings = getNotificationSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error("GET /api/dates/notifications/settings error:", err);
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Malformed request payload: body must be valid JSON." }, { status: 400 });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid payload: settings must be an object." }, { status: 400 });
    }

    const raw = body as Record<string, unknown>;
    const allowedKeys = new Set(["upcomingReminders", "proposalAlerts", "memoryPrompts"]);
    const sanitizedUpdates: Partial<NotificationSettings> = {};

    for (const key of Object.keys(raw)) {
      if (!allowedKeys.has(key)) {
        return NextResponse.json(
          { error: `Invalid setting key '${key}'. Only upcomingReminders, proposalAlerts, and memoryPrompts are allowed.` },
          { status: 400 }
        );
      }
      if (typeof raw[key] !== "boolean") {
        return NextResponse.json(
          { error: `Invalid value for setting '${key}'. Must be a boolean.` },
          { status: 400 }
        );
      }
      sanitizedUpdates[key as keyof NotificationSettings] = raw[key] as boolean;
    }

    const updated = updateNotificationSettings(sanitizedUpdates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("POST /api/dates/notifications/settings error:", err);
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 });
  }
}
