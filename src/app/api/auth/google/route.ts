import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isGoogleAuthConfigured } from "@/lib/auth/config";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
  createOAuthState,
  createPkceVerifier,
  googleAuthorizationUrl,
} from "@/lib/auth/google";
import { cookieSecure } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(new URL("/login?error=google-off", request.url));
  }

  const state = createOAuthState();
  const codeVerifier = createPkceVerifier();
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  cookieStore.set(GOOGLE_OAUTH_STATE_COOKIE, state, cookieOptions);
  cookieStore.set(GOOGLE_OAUTH_VERIFIER_COOKIE, codeVerifier, cookieOptions);

  return NextResponse.redirect(
    googleAuthorizationUrl({ requestUrl: request.url, state, codeVerifier }),
  );
}
