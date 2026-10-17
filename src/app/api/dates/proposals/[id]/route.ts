import { NextResponse } from "next/server";
import { getDateProposal, verifyAccess } from "@/lib/server-db";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const token = url.searchParams.get("token") || "";
    const roleParam = url.searchParams.get("role") || "recipient";

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam as "creator" | "recipient" };
    const role = (auth.authorized ? auth.role : roleParam) as "creator" | "recipient";

    const proposal = getDateProposal(id, role);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, proposal });
  } catch (err) {
    console.error("GET /api/dates/proposals/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch proposal" }, { status: 500 });
  }
}
