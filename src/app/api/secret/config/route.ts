import { NextResponse } from "next/server";
import {
  getPublicSecretHint,
  updateSecretConfig,
  getFullSecretConfigForCreator,
} from "@/lib/secret-world-store";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const isCreator = url.searchParams.get("role") === "creator";

  if (isCreator) {
    return NextResponse.json({
      success: true,
      config: getFullSecretConfigForCreator(),
    });
  }

  // Receiver gets ONLY the public hint
  return NextResponse.json({
    success: true,
    ...getPublicSecretHint(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = updateSecretConfig(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update configuration." },
      { status: 400 }
    );
  }
}
