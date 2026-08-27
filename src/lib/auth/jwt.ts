import { jwtVerify, SignJWT } from "jose";

// jose (não jsonwebtoken): precisa rodar tanto em Node (server actions/route handlers) quanto
// no Edge runtime do middleware, e jose funciona nos dois — jsonwebtoken não roda no Edge.
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurada. Defina um segredo forte em .env.");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  sub: string; // userId
  email: string;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string") return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "session";
export const SESSION_COOKIE_MAX_AGE = SESSION_DURATION_SECONDS;
