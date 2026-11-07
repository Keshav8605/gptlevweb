import { NextResponse } from "next/server";
import { verifySecretPassword } from "@/lib/secret-world-store";

export async function POST(request: Request) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // Continue if empty or not json
    }

    const password = typeof body?.password === "string" ? body.password : "";
    const url = new URL(request.url);
    const giftId =
      (typeof body?.giftId === "string" ? body.giftId : null) ||
      url.searchParams.get("giftId") ||
      "default";

    // Derive a client key from headers for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientKey = forwardedFor ? forwardedFor.split(",")[0].trim() : "client_ip";

    const result = verifySecretPassword(password, clientKey, giftId);

    if (!result.success) {
      const status = result.lockedUntilSeconds ? 429 : 401;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request payload." },
      { status: 400 }
    );
  }
}
