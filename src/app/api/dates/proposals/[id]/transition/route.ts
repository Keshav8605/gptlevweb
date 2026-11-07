import { NextResponse } from "next/server";
import { transitionDateProposal, getDateProposal, type ItineraryStop } from "@/lib/server-db";
import { requireGiftAccess } from "@/lib/access-guard";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Malformed request payload" }, { status: 400 });
    }

    const action = typeof body?.action === "string" ? body.action : "";
    const note = typeof body?.note === "string" ? body.note : undefined;
    const proposedDate = typeof body?.proposedDate === "string" ? body.proposedDate : undefined;
    const proposedStartTime = typeof body?.proposedStartTime === "string" ? body.proposedStartTime : undefined;
    const itinerary = Array.isArray(body?.itinerary) ? (body.itinerary as unknown as ItineraryStop[]) : undefined;
    const reason = typeof body?.reason === "string" ? body.reason : undefined;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const url = new URL(request.url);
    let giftId = (typeof body?.giftId === "string" ? body.giftId : null) || url.searchParams.get("giftId");

    if (!giftId) {
      const p = getDateProposal(id);
      if (p?.giftId) {
        giftId = p.giftId;
      }
    }

    if (!giftId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const proposal = getDateProposal(id);
    if (!proposal || proposal.giftId !== giftId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const result = transitionDateProposal(
      id,
      action as Parameters<typeof transitionDateProposal>[1],
      { note, proposedDate, proposedStartTime, itinerary, reason },
      access.role,
      access.name
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Action failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, proposal: result.proposal });
  } catch (err) {
    console.error("POST /api/dates/proposals/[id]/transition error:", err);
    return NextResponse.json({ error: "Failed to transition proposal state" }, { status: 500 });
  }
}
