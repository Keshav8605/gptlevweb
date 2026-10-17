import { NextResponse } from "next/server";
import { updateProposalChecklist, verifyAccess } from "@/lib/server-db";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { checklist, token, role: roleParam, name: nameParam } = body;

    if (!Array.isArray(checklist)) {
      return NextResponse.json({ error: "Checklist must be an array" }, { status: 400 });
    }

    const auth = token ? verifyAccess(token) : { authorized: true, role: roleParam || "recipient", name: nameParam || "Baby" };
    const role = (auth.authorized ? auth.role : (roleParam || "recipient")) as "creator" | "recipient";
    const name = auth.authorized ? auth.name : (nameParam || (role === "creator" ? "Babe" : "Baby"));

    const updatedChecklist = updateProposalChecklist(id, checklist, role, name);
    if (!updatedChecklist) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, checklist: updatedChecklist });
  } catch (err) {
    console.error("PATCH /api/dates/proposals/[id]/checklist error:", err);
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}
