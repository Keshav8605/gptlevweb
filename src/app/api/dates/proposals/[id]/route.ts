import { NextResponse } from "next/server";
import { getDateProposal } from "@/lib/server-db";
import { requireGiftAccess } from "@/lib/access-guard";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    let giftId = url.searchParams.get("giftId");

    if (!giftId) {
      const p = getDateProposal(id);
      if (p?.giftId) {
        giftId = p.giftId;
      }
    }

    if (!giftId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Run access check BEFORE looking up the proposal data or gift
    const access = await requireGiftAccess(request, giftId);
    if (!access.authorized) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const proposal = getDateProposal(id, access.role);
    if (!proposal || proposal.giftId !== giftId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    return NextResponse.json({ success: true, proposal });
  } catch (err) {
    console.error("GET /api/dates/proposals/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 });
  }
}
