import { NextResponse } from "next/server";
import {
  getDateIdeas,
  addDateIdea,
  updateDateIdea,
  deleteDateIdea,
  verifyAccess,
  getDatePreferences,
} from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const roleParam = url.searchParams.get("role") || "";

    const auth = token ? verifyAccess(token) : { authorized: false, role: (roleParam === "creator" ? "creator" : "recipient") as "creator" | "recipient", name: roleParam === "creator" ? "Babe" : "Baby" };
    const effectiveRole = auth.authorized ? auth.role : ((roleParam === "creator" ? "creator" : "recipient") as "creator" | "recipient");

    const ideas = getDateIdeas(effectiveRole === "creator");
    const prefRole = (effectiveRole === "creator" ? "creator" : "recipient") as "creator" | "recipient";
    const preferences = getDatePreferences(prefRole);

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
    const body = await request.json();
    const token = body.token || "";
    const roleParam = body.role || "creator";
    const authorName = body.authorName || (roleParam === "creator" ? "Babe" : "Baby");

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam, name: authorName };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";
    const name = auth.authorized ? auth.name : authorName;

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required for a date idea" }, { status: 400 });
    }

    const created = addDateIdea(body, role, name);
    return NextResponse.json({ success: true, idea: created });
  } catch (err) {
    console.error("POST /api/dates/ideas error:", err);
    return NextResponse.json({ error: "Failed to create date idea" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const roleParam = body.role || "creator";
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 });
    }

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam, name: "Babe" };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";

    const updated = updateDateIdea(id, body.updates || body, role);
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
    const token = url.searchParams.get("token") || "";
    const roleParam = url.searchParams.get("role") || "creator";

    if (!id) {
      return NextResponse.json({ error: "Idea ID is required" }, { status: 400 });
    }

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam, name: "Babe" };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";

    const ok = deleteDateIdea(id, role);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized or idea not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/dates/ideas error:", err);
    return NextResponse.json({ error: "Failed to delete date idea" }, { status: 500 });
  }
}
