import { NextResponse } from "next/server";
import { verifySecretPassword } from "@/lib/secret-world-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = body.password || "";

    // Derive a client key from headers for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientKey = forwardedFor ? forwardedFor.split(",")[0].trim() : "client_ip";

    const result = verifySecretPassword(password, clientKey);

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
