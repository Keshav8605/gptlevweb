import { NextResponse } from "next/server";
import { getGiftById, updateGift, deleteGift } from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const token =
      url.searchParams.get("token") ||
      url.searchParams.get("invite") ||
      "";

    const gift = getGiftById(id);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    const auth = await getAuthenticatedCreator(request);
    const isOwner =
      auth.authenticated &&
      Boolean(auth.userId) &&
      Boolean(gift.creatorId) &&
      gift.creatorId === auth.userId;

    const isRecipient =
      Boolean(token) &&
      token === gift.privacy?.recipientInviteToken &&
      gift.privacy?.invitationStatus === "active";

    // Protect drafts from unauthorized public or cross-creator viewing
    if (gift.status !== "published") {
      if (!isOwner && !isRecipient) {
        return NextResponse.json(
          {
            error: "This gift is currently in draft mode and has not been published yet.",
            status: gift.status,
          },
          { status: 403 }
        );
      }
    }

    // If caller is not the verified owner, strictly sanitize secrets and tokens
    if (!isOwner) {
      const sanitizedGift = {
        ...gift,
        secretPassword: undefined,
        secretContent: undefined, // Unlocked only via /api/secret/verify
        privacy: {
          isPasswordProtected: gift.privacy?.isPasswordProtected ?? false,
          invitationStatus: gift.privacy?.invitationStatus ?? "active",
          allowResponses: gift.privacy?.allowResponses ?? true,
          allowRecipientContributions: gift.privacy?.allowRecipientContributions ?? true,
          // Explicitly strip plaintext passcode and recipientInviteToken
        },
      };
      return NextResponse.json({ success: true, gift: sanitizedGift });
    }

    return NextResponse.json({ success: true, gift });
  } catch (err) {
    console.error("GET /api/gifts/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Enforce verified creator authentication
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Authentication required. Creator credentials must be provided." },
        { status: auth.statusCode || 401 }
      );
    }

    // 2. Verify gift exists
    const gift = getGiftById(id);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    // 3. Protect demo gift from unauthorized modification
    if (gift.id === "gift_world_demo") {
      return NextResponse.json(
        { error: "Forbidden. The default demo gift is protected and cannot be modified." },
        { status: 403 }
      );
    }

    // 4. Reject modification to unowned legacy gifts
    if (!gift.creatorId) {
      return NextResponse.json(
        { error: "Forbidden. Unowned legacy gift cannot be modified without authorization." },
        { status: 403 }
      );
    }

    // 5. Verify creator ownership
    if (gift.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to modify this gift." },
        { status: 403 }
      );
    }

    const updates = await request.json();
    const updated = updateGift(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, gift: updated });
  } catch (err) {
    console.error("PUT /api/gifts/[id] error:", err);
    return NextResponse.json({ error: "Failed to update gift" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Enforce verified creator authentication
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Authentication required. Creator credentials must be provided." },
        { status: auth.statusCode || 401 }
      );
    }

    // 2. Verify gift exists
    const gift = getGiftById(id);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    // 3. Protect demo gift from deletion
    if (gift.id === "gift_world_demo") {
      return NextResponse.json(
        { error: "Forbidden. The default demo gift is protected and cannot be deleted." },
        { status: 403 }
      );
    }

    // 4. Reject deletion of unowned legacy gifts
    if (!gift.creatorId) {
      return NextResponse.json(
        { error: "Forbidden. Unowned legacy gift cannot be deleted without authorization." },
        { status: 403 }
      );
    }

    // 5. Verify creator ownership
    if (gift.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to delete this gift." },
        { status: 403 }
      );
    }

    const ok = deleteGift(id);
    if (!ok) {
      return NextResponse.json(
        { error: "Cannot delete this gift. At least one gift must remain." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/gifts/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete gift" }, { status: 500 });
  }
}
