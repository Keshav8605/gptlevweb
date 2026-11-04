import { NextResponse } from "next/server";
import {
  getCreatorResponseSummary,
  markResponsesAsViewed,
  getGiftById,
} from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

export async function GET(request: Request) {
  // 1. Enforce verified creator authentication
  const auth = await getAuthenticatedCreator(request);
  if (!auth.authenticated || !auth.userId) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized. Creator authentication required to view responses." },
      { status: auth.statusCode || 401 }
    );
  }

  const url = new URL(request.url);
  const giftId = url.searchParams.get("giftId") || undefined;

  // 2. If giftId is specified, verify existence and creator ownership
  if (giftId) {
    const gift = getGiftById(giftId);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found." }, { status: 404 });
    }
    if (!gift.creatorId || gift.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. Gift lacks creator ownership or does not belong to you." },
        { status: 403 }
      );
    }
  }

  // 3. Return strictly isolated response summary scoped to the authenticated creator's gifts
  const summary = getCreatorResponseSummary(auth.userId, giftId);

  return NextResponse.json({
    success: true,
    summary,
    role: "creator",
  });
}

export async function POST(request: Request) {
  try {
    // 1. Enforce verified creator authorization
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized. Creator authorization required to mark responses as viewed." },
        { status: auth.statusCode || 401 }
      );
    }

    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const giftId = body.giftId || url.searchParams.get("giftId") || undefined;

    // 2. If giftId is specified, verify existence and creator ownership
    if (giftId) {
      const gift = getGiftById(giftId);
      if (!gift) {
        return NextResponse.json({ error: "Gift not found." }, { status: 404 });
      }
      if (!gift.creatorId || gift.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. Gift lacks creator ownership or does not belong to you." },
        { status: 403 }
      );
    }
    }

    // 3. Mark responses as viewed only for records belonging to the authenticated creator
    const result = markResponsesAsViewed(auth.userId, giftId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to mark responses as viewed" }, { status: 400 });
  }
}
