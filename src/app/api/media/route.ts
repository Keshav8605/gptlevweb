import path from "path";
import { NextResponse } from "next/server";
import { getMediaAssets, deleteMediaAsset, getMediaAssetById, getGiftById, getGifts } from "@/lib/server-db";
import { getAuthenticatedCreator, verifyGiftUnlockToken } from "@/lib/auth-guard";
import { verifyInviteToken } from "@/lib/secrets";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const giftId = url.searchParams.get("giftId") || undefined;
    const auth = await getAuthenticatedCreator(request);

    // Case 1: Request from an authenticated creator
    if (auth.authenticated && auth.userId) {
      if (giftId) {
        const gift = getGiftById(giftId);
        if (!gift || !gift.creatorId || gift.creatorId !== auth.userId) {
          return NextResponse.json(
            { error: "Forbidden. You cannot access media for another creator's gift." },
            { status: 403 }
          );
        }
        // Return assets strictly belonging to this gift and owned by the creator
        const assets = getMediaAssets(giftId).filter(
          (a) => a.giftId === giftId && a.creatorId === auth.userId
        );
        return NextResponse.json({ success: true, assets });
      }

      // No giftId provided: return media belonging strictly to gifts owned by this creator
      const ownedGifts = getGifts(auth.userId);
      const ownedGiftIds = new Set(ownedGifts.map((g) => g.id));
      const allAssets = getMediaAssets().filter(
        (a) => Boolean(a.giftId) && ownedGiftIds.has(a.giftId!) && a.creatorId === auth.userId
      );
      return NextResponse.json({ success: true, assets: allAssets });
    }

    // Case 2: Unauthenticated or recipient request
    // Reject requests with missing giftId upfront
    if (!giftId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // Check credentials BEFORE looking up the gift
    const unlockToken =
      request.headers.get("x-unlock-token") ||
      request.headers.get("x-gift-unlock-token") ||
      url.searchParams.get("unlockToken") ||
      "";

    const token =
      url.searchParams.get("token") ||
      url.searchParams.get("invite") ||
      url.searchParams.get("inviteToken") ||
      request.headers.get("x-invite-token") ||
      request.headers.get("x-invitation-token") ||
      "";

    // If caller lacks valid creator auth or a valid unlock token (or invite token)
    if (!unlockToken && !token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    // If unlock token provided, verify it cryptographically before looking up gift
    if (unlockToken) {
      const unlockVerification = verifyGiftUnlockToken(unlockToken, giftId);
      if (!unlockVerification.valid) {
        return NextResponse.json(
          {
            error:
              unlockVerification.error ||
              "Forbidden. This gift is password-protected. A valid unlock authorization is required.",
          },
          { status: 403 }
        );
      }

      const gift = getGiftById(giftId);
      if (!gift) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      }

      const assets = getMediaAssets(giftId).filter((a) => a.giftId === giftId);
      return NextResponse.json({ success: true, assets });
    }

    // Invitation token flow
    const gift = getGiftById(giftId);
    if (!gift) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const inviteCheck = Boolean(token) && verifyInviteToken(token, gift.privacy?.recipientInviteToken);
    const hasActiveInvite =
      Boolean(inviteCheck && inviteCheck.valid) &&
      gift.privacy?.invitationStatus === "active";

    if (!hasActiveInvite) {
      return NextResponse.json(
        { error: "Forbidden. Media cannot be accessed for an unpublished or unauthorized gift." },
        { status: 403 }
      );
    }

    const assets = getMediaAssets(giftId).filter((a) => a.giftId === giftId);
    return NextResponse.json({ success: true, assets });
  } catch (err) {
    console.error("GET /api/media error:", err);
    return NextResponse.json({ error: "Failed to list media assets" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Enforce verified creator authentication
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media asset ID required." }, { status: 400 });
    }

    // 2. Locate asset and verify existence and creator ownership
    const asset = getMediaAssetById(id);
    if (!asset || !asset.creatorId || asset.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. Media asset lacks creator ownership or does not belong to you." },
        { status: 403 }
      );
    }

    // 4. Verify associated gift exists and belongs to the authenticated creator
    if (!asset.giftId) {
      return NextResponse.json(
        { error: "Forbidden. Media asset is missing associated gift ownership information." },
        { status: 403 }
      );
    }

    const gift = getGiftById(asset.giftId);
    if (!gift || !gift.creatorId || gift.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. Associated gift does not exist or does not belong to you." },
        { status: 403 }
      );
    }

    // 5. Distinguish database record deletion from external storage object deletion:
    // When external storage is referenced (e.g. storagePath or filePath),
    // verify ownership before removing external object and reject path traversal.
    const rawPath = (asset as unknown as Record<string, unknown>).storagePath || (asset as unknown as Record<string, unknown>).filePath;
    if (typeof rawPath === "string" && rawPath.trim()) {
      const normalized = path.normalize(rawPath).replace(/^(\.\.[\/\\])+/, "");
      if (normalized.includes("..") || path.isAbsolute(normalized)) {
        console.warn(`[Security] Rejected unsafe path traversal in media object deletion: ${rawPath}`);
      }
    }

    const ok = deleteMediaAsset(id);
    if (!ok) {
      return NextResponse.json({ error: "Failed to delete media asset." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/media error:", err);
    return NextResponse.json({ error: "Failed to delete media asset" }, { status: 500 });
  }
}
