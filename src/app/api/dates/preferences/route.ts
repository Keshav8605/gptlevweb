import { NextResponse } from "next/server";
import { getDatePreferences, updateDatePreference, verifyAccess } from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const roleParam = url.searchParams.get("role") || "recipient";
    const role = (roleParam === "creator" ? "creator" : "recipient") as "creator" | "recipient";

    const preferences = getDatePreferences(role);
    return NextResponse.json({ success: true, preferences });
  } catch (err) {
    console.error("GET /api/dates/preferences error:", err);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideaId, updates, token, role: roleParam, name: nameParam } = body;

    if (!ideaId) {
      return NextResponse.json({ error: "ideaId is required" }, { status: 400 });
    }

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam || "recipient", name: nameParam || "Baby" };
    const role = (auth.authorized ? auth.role : (roleParam || "recipient")) as "creator" | "recipient";
    const name = auth.authorized ? auth.name : (nameParam || (role === "creator" ? "Babe" : "Baby"));

    const updated = updateDatePreference(ideaId, updates || {}, role, name);
    return NextResponse.json({ success: true, preference: updated });
  } catch (err) {
    console.error("POST /api/dates/preferences error:", err);
    return NextResponse.json({ error: "Failed to update preference" }, { status: 500 });
  }
}
