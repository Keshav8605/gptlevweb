import { NextResponse } from "next/server";
import {
  getDateMemories,
  addDateMemory,
  deleteDateMemory,
  verifyAccess,
} from "@/lib/server-db";

export async function GET() {
  try {
    const memories = getDateMemories();
    return NextResponse.json({ success: true, memories });
  } catch (err) {
    console.error("GET /api/dates/memories error:", err);
    return NextResponse.json({ error: "Failed to fetch date memories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const roleParam = body.role || "recipient";
    const nameParam = body.authorName || (roleParam === "creator" ? "Babe" : "Baby");

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam, name: nameParam };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";
    const name = auth.authorized ? auth.name : nameParam;

    if (!body.dateTitle || !body.dateTitle.trim()) {
      return NextResponse.json({ error: "Date title is required" }, { status: 400 });
    }

    const created = addDateMemory(body, role, name);
    return NextResponse.json({ success: true, memory: created });
  } catch (err) {
    console.error("POST /api/dates/memories error:", err);
    return NextResponse.json({ error: "Failed to create date memory" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("token") || "";
    const roleParam = url.searchParams.get("role") || "creator";

    if (!id) {
      return NextResponse.json({ error: "Memory ID is required" }, { status: 400 });
    }

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam as "creator" | "recipient" };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";

    const ok = deleteDateMemory(id, role);
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized or memory not found" }, { status: 403 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/dates/memories error:", err);
    return NextResponse.json({ error: "Failed to delete date memory" }, { status: 500 });
  }
}
