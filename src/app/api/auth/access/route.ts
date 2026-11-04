import { NextResponse } from "next/server";
import { verifyAccess, updateCoupleConfig, getCoupleConfig } from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

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

  // Return public couple info only — zero invitation tokens or passcodes
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
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized. Verified creator access required." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();

    const updated = updateCoupleConfig({
      recipientInviteToken: body.recipientInviteToken,
      invitationStatus: body.invitationStatus,
      creatorName: body.creatorName,
      recipientName: body.recipientName,
    });

    // Return sanitized configuration without master passcodes
    return NextResponse.json({
      success: true,
      config: {
        giftId: updated.giftId,
        invitationStatus: updated.invitationStatus,
        creatorName: updated.creatorName,
        recipientName: updated.recipientName,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 400 });
  }
}
