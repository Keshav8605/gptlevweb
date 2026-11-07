import { NextResponse } from "next/server";
import {
  getDateProposals,
  createDateProposal,
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

    const proposals = getDateProposals(access.role, giftId);
    return NextResponse.json({ success: true, proposals });
  } catch (err) {
    console.error("GET /api/dates/proposals error:", err);
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const dedupeKey = typeof body.dedupeKey === "string" ? body.dedupeKey : undefined;
    const role = access.role;
    const name = access.name;

    const title = typeof body.title === "string" ? body.title : "";
    if (!title.trim()) {
      return NextResponse.json({ error: "Title is required for a date proposal" }, { status: 400 });
    }

    if (!body.proposedDate) {
      return NextResponse.json({ error: "A proposed date is required" }, { status: 400 });
    }

    const created = createDateProposal({ ...(body as unknown as Parameters<typeof createDateProposal>[0]), giftId }, role, name, dedupeKey);
    return NextResponse.json({ success: true, proposal: created });
  } catch (err) {
    console.error("POST /api/dates/proposals error:", err);
    return NextResponse.json({ error: "Failed to create date proposal" }, { status: 500 });
  }
}
