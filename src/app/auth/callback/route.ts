import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/dashboard";

  // Prevent open redirect attacks: ensure next is a relative URL path
  let next = "/dashboard";
  if (
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.includes("\\")
  ) {
    next = rawNext;
  }

  // Handle errors emitted by Supabase (e.g. expired link, access denied)
  const authError = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");
  if (authError) {
    const message = errorDescription || "Verification link is invalid or has expired.";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        "/login?error=" + encodeURIComponent("Missing confirmation code."),
        request.url
      )
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[Auth Callback] exchangeCodeForSession failed:", error.message);
      return NextResponse.redirect(
        new URL(
          "/login?error=" +
            encodeURIComponent(
              "Your confirmation link is invalid or has expired. Please try logging in or requesting a new confirmation."
            ),
          request.url
        )
      );
    }
  } catch (err) {
    console.error("[Auth Callback] Unexpected error:", err);
    return NextResponse.redirect(
      new URL(
        "/login?error=" +
          encodeURIComponent("An unexpected error occurred during confirmation."),
        request.url
      )
    );
  }

  // In production behind reverse proxies (e.g., Vercel), use forwarded host headers
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";

  if (forwardedHost && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(`${forwardedProto}://${forwardedHost}${next}`);
  }

  return NextResponse.redirect(new URL(next, request.url));
}

