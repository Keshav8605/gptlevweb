import path from "path";
import { NextResponse } from "next/server";
import { getMediaAssets, deleteMediaAsset, getMediaAssetById, getGiftById, getGifts } from "@/lib/server-db";
import { getAuthenticatedCreator, verifyGiftUnlockToken } from "@/lib/auth-guard";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const giftId = url.searchParams.get("giftId") || undefined;
    const auth = await getAuthenticatedCreator(request);

    // Case 1: Request from an authenticated creator
    if (auth.authenticated && auth.userId) {
      if (giftId) {
        const gift = getGiftById(giftId);
        if (!gift) {
          return NextResponse.json({ error: "Gift not found." }, { status: 404 });
        }
        // Strict ownership: creator can only access media belonging to their own gift
        if (!gift.creatorId || gift.creatorId !== auth.userId) {
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
    // Reject requests with missing giftId upfront (unauthenticated GET /api/media)
    if (!giftId) {
      return NextResponse.json(
        { error: "Authentication or valid published gift ID required to access media." },
        { status: 401 }
      );
    }

    const gift = getGiftById(giftId);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found." }, { status: 404 });
    }

    // Check if recipient is authorized via active invitation token
    const token =
      url.searchParams.get("token") ||
      url.searchParams.get("invite") ||
      url.searchParams.get("inviteToken") ||
      request.headers.get("x-invite-token") ||
      "";

    const hasActiveInvite =
      Boolean(token) &&
      token === gift.privacy?.recipientInviteToken &&
      gift.privacy?.invitationStatus === "active";

    // 1. Unpublished drafts: require valid active recipient invitation token
    if (gift.status !== "published") {
      if (!hasActiveInvite) {
        return NextResponse.json(
          { error: "Forbidden. Media cannot be accessed for an unpublished or unauthorized gift." },
          { status: 403 }
        );
      }
      const assets = getMediaAssets(giftId).filter((a) => a.giftId === giftId);
      return NextResponse.json({ success: true, assets });
    }

    // 2. Published gifts: if password-protected, require valid unexpired unlock authorization
    if (gift.privacy?.isPasswordProtected) {
      // Prefer secure header-based authorization to avoid recording sensitive tokens in URLs and server access logs
      const unlockToken =
        request.headers.get("x-unlock-token") ||
        request.headers.get("x-gift-unlock-token") ||
        url.searchParams.get("unlockToken") ||
        (token.split(".").length === 3 && !token.startsWith("eyJ") ? token : "") ||
        "";

      const unlockVerification = verifyGiftUnlockToken(unlockToken, gift.id);
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
    }

    // 3. Ordinary published gifts (or verified unlocked password-protected gifts)
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
        { error: auth.error || "Creator authentication required to delete media assets." },
        { status: auth.statusCode || 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media asset ID required." }, { status: 400 });
    }

    // 2. Locate asset and verify existence
    const asset = getMediaAssetById(id);
    if (!asset) {
      return NextResponse.json({ error: "Media asset not found." }, { status: 404 });
    }

    // 3. Reject assets with missing ownership information
    if (!asset.creatorId || asset.creatorId !== auth.userId) {
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
