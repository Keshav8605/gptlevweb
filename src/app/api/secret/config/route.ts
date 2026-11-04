import { NextResponse } from "next/server";
import {
  getPublicSecretHint,
  updateSecretConfig,
  getFullSecretConfigForCreator,
} from "@/lib/secret-world-store";
import { getGiftById } from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const wantsCreator = url.searchParams.get("role") === "creator";
  const giftId = url.searchParams.get("giftId") || "";

  // 1. If giftId is specified, verify existence upfront
  if (giftId) {
    const gift = getGiftById(giftId);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found." }, { status: 404 });
    }
  }

  if (wantsCreator) {
    // 2. Enforce verified creator authentication
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized. Creator authentication required to view secret config." },
        { status: auth.statusCode || 401 }
      );
    }

    // 3. If giftId provided, enforce verified creator ownership
    if (giftId) {
      const gift = getGiftById(giftId)!;
      if (!gift.creatorId || gift.creatorId !== auth.userId) {
        return NextResponse.json(
          { error: "Forbidden. You do not own this gift's secret configuration." },
          { status: 403 }
        );
      }
    }

    const ownerKey = giftId || auth.userId;
    return NextResponse.json({
      success: true,
      config: getFullSecretConfigForCreator(ownerKey),
    });
  }

  // 4. Public recipient access receives ONLY safe public hint — never passwords or letter content
  let hint = getPublicSecretHint("default").hint;
  if (giftId) {
    const gift = getGiftById(giftId);
    if (gift?.secretHint) {
      hint = gift.secretHint;
    }
  }

  return NextResponse.json({
    success: true,
    hint,
  });
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);

    // 1. Enforce verified creator authentication
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Unauthorized. Creator access required to modify secret configuration." },
        { status: auth.statusCode || 401 }
      );
    }

    const body = await request.json();
    const giftId = url.searchParams.get("giftId") || body.giftId || "";

    // 2. If giftId provided, verify existence and creator ownership
    if (giftId) {
      const gift = getGiftById(giftId);
      if (!gift) {
        return NextResponse.json({ error: "Gift not found." }, { status: 404 });
      }
      if (!gift.creatorId || gift.creatorId !== auth.userId) {
        return NextResponse.json(
          { error: "Forbidden. You do not have permission to modify another creator's secret configuration." },
          { status: 403 }
        );
      }
    }

    const ownerKey = giftId || auth.userId;
    const result = updateSecretConfig(body, ownerKey);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update configuration." },
      { status: 400 }
    );
  }
}
