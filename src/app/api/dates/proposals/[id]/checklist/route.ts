import { NextResponse } from "next/server";
import { updateProposalChecklist, getDateProposal } from "@/lib/server-db";
import { requireGiftAccess } from "@/lib/access-guard";

export async function PATCH(
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

    const checklist = body?.checklist;

    if (!Array.isArray(checklist)) {
      return NextResponse.json({ error: "Checklist must be an array" }, { status: 400 });
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

    const updatedChecklist = updateProposalChecklist(id, checklist, access.role, access.name);
    if (!updatedChecklist) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    return NextResponse.json({ success: true, checklist: updatedChecklist });
  } catch (err) {
    console.error("PATCH /api/dates/proposals/[id]/checklist error:", err);
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}
