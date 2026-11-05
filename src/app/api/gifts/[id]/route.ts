import { NextResponse } from "next/server";
import {
  getGiftById,
  updateGift,
  deleteGift,
  validateGiftUpdates,
  GiftRecord,
} from "@/lib/server-db";
import { getAuthenticatedCreator, createGiftUnlockToken } from "@/lib/auth-guard";

/**
 * Extracts gift access credentials with secure header priority:
 * 1. HTTP Headers: x-gift-passcode / x-passcode, x-invitation-token / x-invite-token
 * 2. POST JSON Body: { passcode, token }
 * 3. Query string fallback: ?passcode=, ?token=, ?invite= (backward compatibility)
 * Never logs credentials.
 */
async function extractCredentials(request: Request): Promise<{ passcode: string; token: string }> {
  let passcode =
    request.headers.get("x-gift-passcode") ||
    request.headers.get("x-passcode") ||
    "";
  let token =
    request.headers.get("x-invitation-token") ||
    request.headers.get("x-invite-token") ||
    "";

  if (request.method === "POST") {
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.clone().json();
        if (body && typeof body === "object" && !Array.isArray(body)) {
          const rec = body as Record<string, unknown>;
          if (!passcode && typeof rec.passcode === "string") {
            passcode = rec.passcode;
          }
          if (!token && typeof rec.token === "string") {
            token = rec.token;
          }
          if (!token && typeof rec.invite === "string") {
            token = rec.invite;
          }
        }
      }
    } catch {
      // Ignore JSON parse errors in body
    }
  }

  if (!passcode || !token) {
    try {
      const url = new URL(request.url);
      if (!passcode) {
        passcode = url.searchParams.get("passcode") || "";
      }
      if (!token) {
        token =
          url.searchParams.get("token") ||
          url.searchParams.get("invite") ||
          url.searchParams.get("inviteToken") ||
          "";
      }
    } catch {
      // Ignore URL parse errors
    }
  }

  return { passcode, token };
}

async function handleGiftAccessById(
  request: Request,
  id: string
): Promise<NextResponse> {
  try {
    const { passcode, token } = await extractCredentials(request);

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

    // 1. Protect drafts from unauthorized public or cross-creator viewing
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

    // 2. Check password protection for published gifts (or non-owners)
    if (gift.privacy?.isPasswordProtected && !isOwner) {
      const isPasscodeUnlocked = Boolean(passcode) && passcode === gift.privacy?.passcode;
      if (!isPasscodeUnlocked && !isRecipient) {
        return NextResponse.json({
          success: true,
          isLocked: true,
          giftId: gift.id,
          title: gift.title,
          recipientNickname: gift.recipientNickname,
        });
      }
    }

    // 3. If caller is not the verified owner, strictly sanitize secrets and tokens
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

      let unlockToken: string | undefined;
      try {
        unlockToken = createGiftUnlockToken(gift.id);
      } catch (tokenErr) {
        if (gift.privacy?.isPasswordProtected) {
          console.error("Failed to generate unlock token for password-protected gift.");
          return NextResponse.json(
            { error: "Server configuration error: unable to generate unlock authorization." },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true, gift: sanitizedGift, unlockToken });
    }

    let unlockToken: string | undefined;
    try {
      unlockToken = createGiftUnlockToken(gift.id);
    } catch {
      // Non-blocking for owner view
    }

    return NextResponse.json({ success: true, gift, unlockToken });
  } catch {
    console.error("Failed to process gift request by ID.");
    return NextResponse.json({ error: "Failed to fetch gift" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return handleGiftAccessById(request, id);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return handleGiftAccessById(request, id);
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

    // 6. Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Malformed request payload: body must be valid JSON." },
        { status: 400 }
      );
    }

    const validation = validateGiftUpdates(rawBody);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid gift update data." },
        { status: 400 }
      );
    }

    try {
      const updated = updateGift(id, rawBody as Partial<GiftRecord>);
      if (!updated) {
        return NextResponse.json({ error: "Gift not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, gift: updated });
    } catch (updateErr: unknown) {
      const message = updateErr instanceof Error ? updateErr.message : "Failed to update gift";
      const isPersistence = message.includes("Database persistence failed");
      return NextResponse.json({ error: message }, { status: isPersistence ? 500 : 400 });
    }
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
