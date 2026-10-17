import { NextResponse } from "next/server";
import { transitionDateProposal, verifyAccess } from "@/lib/server-db";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action, note, proposedDate, proposedStartTime, itinerary, reason, token, role: roleParam, name: nameParam } = body;

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 });
    }

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam || "recipient", name: nameParam || "Baby" };
    const role = (auth.authorized ? auth.role : (roleParam || "recipient")) as "creator" | "recipient";
    const name = auth.authorized ? auth.name : (nameParam || (role === "creator" ? "Babe" : "Baby"));

    const result = transitionDateProposal(
      id,
      action,
      { note, proposedDate, proposedStartTime, itinerary, reason },
      role,
      name
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
