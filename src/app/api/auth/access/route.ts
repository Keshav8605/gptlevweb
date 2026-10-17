import { NextResponse } from "next/server";
import { verifyAccess, updateCoupleConfig, getCoupleConfig } from "@/lib/server-db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = body.token || body.passcode || "";

    const result = verifyAccess(token);
    if (!result.authorized) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ authorized: false, error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || url.searchParams.get("passcode") || "";

  if (token) {
    const result = verifyAccess(token);
    return NextResponse.json(result);
  }

  // Return public couple info (names, invitation status)
  const config = getCoupleConfig();
  return NextResponse.json({
    success: true,
    creatorName: config.creatorName,
    recipientName: config.recipientName,
    invitationStatus: config.invitationStatus,
  });
}

// Creator can update invitation status / token
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const creatorPasscode = body.creatorPasscode;

    const auth = verifyAccess(creatorPasscode);
    if (!auth.authorized || auth.role !== "creator") {
      return NextResponse.json({ error: "Unauthorized. Creator access required." }, { status: 403 });
    }

    const updated = updateCoupleConfig({
      recipientInviteToken: body.recipientInviteToken,
      invitationStatus: body.invitationStatus,
      creatorName: body.creatorName,
      recipientName: body.recipientName,
    });

    return NextResponse.json({ success: true, config: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 400 });
  }
}
