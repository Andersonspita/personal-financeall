import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthError, upsertUserFromGoogle } from "@/lib/auth/service";
import { createSession } from "@/lib/auth/session";
import { getOnboardingStatus } from "@/lib/profile/service";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_VERIFIER_COOKIE,
  exchangeGoogleCode,
} from "@/lib/auth/google";
import { logAppError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  const loginError = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, request.url));

  try {
    const url = new URL(request.url);
    if (url.searchParams.get("error")) return loginError("google-denied");

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const expectedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
    const codeVerifier = cookieStore.get(GOOGLE_OAUTH_VERIFIER_COOKIE)?.value;

    cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE);
    cookieStore.delete(GOOGLE_OAUTH_VERIFIER_COOKIE);

    if (!code || !state || !expectedState || !codeVerifier || state !== expectedState) {
      return loginError("google");
    }

    const profile = await exchangeGoogleCode({
      requestUrl: request.url,
      code,
      codeVerifier,
    });
    const user = await upsertUserFromGoogle(profile);
    await createSession(user.id, user.email);
    const status = await getOnboardingStatus(user.id);
    return NextResponse.redirect(new URL(status === "pending" ? "/onboarding" : "/", request.url));
  } catch (err) {
    if (!(err instanceof AuthError)) logAppError("auth.google.callback", err);
    return loginError("google");
  }
}
