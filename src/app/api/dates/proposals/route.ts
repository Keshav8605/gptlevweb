import { NextResponse } from "next/server";
import {
  getDateProposals,
  createDateProposal,
  verifyAccess,
} from "@/lib/server-db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const roleParam = url.searchParams.get("role") || "";

    const auth = token ? verifyAccess(token) : { authorized: false, role: (roleParam === "creator" ? "creator" : "recipient") as "creator" | "recipient", name: roleParam === "creator" ? "Babe" : "Baby" };
    const effectiveRole = auth.authorized ? auth.role : ((roleParam === "creator" ? "creator" : "recipient") as "creator" | "recipient");

    const proposals = getDateProposals(effectiveRole);
    return NextResponse.json({ success: true, proposals });
  } catch (err) {
    console.error("GET /api/dates/proposals error:", err);
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || "";
    const roleParam = body.proposerRole || body.role || "creator";
    const nameParam = body.proposerName || (roleParam === "creator" ? "Babe" : "Baby");
    const dedupeKey = body.dedupeKey;

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam, name: nameParam };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";
    const name = auth.authorized ? auth.name : nameParam;

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required for a date proposal" }, { status: 400 });
    }

    if (!body.proposedDate) {
      return NextResponse.json({ error: "A proposed date is required" }, { status: 400 });
    }

    const created = createDateProposal(body, role, name, dedupeKey);
    return NextResponse.json({ success: true, proposal: created });
  } catch (err) {
    console.error("POST /api/dates/proposals error:", err);
    return NextResponse.json({ error: "Failed to create date proposal" }, { status: 500 });
  }
}
