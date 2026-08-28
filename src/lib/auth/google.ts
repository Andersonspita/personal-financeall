import { createHash, randomBytes } from "crypto";
import { appBaseUrl } from "@/lib/auth/config";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const GOOGLE_OAUTH_STATE_COOKIE = "oauth_google_state";
export const GOOGLE_OAUTH_VERIFIER_COOKIE = "oauth_google_verifier";

export type GoogleProfile = {
  googleId: string;
  email: string;
  name: string;
};

export function createOAuthState(): string {
  return randomBytes(16).toString("base64url");
}

export function createPkceVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function pkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function googleCallbackUrl(requestUrl: string): string {
  return `${appBaseUrl(requestUrl)}/api/auth/google/callback`;
}

export function googleAuthorizationUrl(input: {
  requestUrl: string;
  state: string;
  codeVerifier: string;
}): string {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID não configurada.");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleCallbackUrl(input.requestUrl),
    response_type: "code",
    scope: "openid email profile",
    state: input.state,
    code_challenge: pkceChallenge(input.codeVerifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(input: {
  requestUrl: string;
  code: string;
  codeVerifier: string;
}): Promise<GoogleProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth não está configurado.");
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: input.code,
      code_verifier: input.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: googleCallbackUrl(input.requestUrl),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error("Falha ao trocar o código do Google.");
  }

  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) throw new Error("Google não devolveu access_token.");

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileResponse.ok) throw new Error("Falha ao ler o perfil do Google.");

  const profile = (await profileResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!profile.sub || !profile.email || profile.email_verified === false) {
    throw new Error("A conta Google precisa ter um e-mail verificado.");
  }

  return {
    googleId: profile.sub,
    email: profile.email.trim().toLowerCase(),
    name: (profile.name ?? profile.email.split("@")[0]).slice(0, 80),
  };
}
