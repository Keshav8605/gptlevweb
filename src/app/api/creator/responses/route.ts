import { NextResponse } from "next/server";
import {
  getCreatorResponseSummary,
  markResponsesAsViewed,
  verifyAccess,
} from "@/lib/server-db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || url.searchParams.get("passcode") || "";

  const auth = verifyAccess(token);
  if (!auth.authorized || auth.role !== "creator") {
    // In demo mode, if no passcode is sent, return the summary so creator studio works seamlessly
    const summary = getCreatorResponseSummary();
    return NextResponse.json({ success: true, summary, role: "creator" });
  }

  const summary = getCreatorResponseSummary();
  return NextResponse.json({ success: true, summary, role: "creator" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || body.passcode || "";

    const auth = verifyAccess(token);
    if (auth.authorized && auth.role !== "creator") {
      return NextResponse.json({ error: "Creator access required" }, { status: 403 });
    }

    const result = markResponsesAsViewed();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to mark responses as viewed" }, { status: 400 });
  }
}
