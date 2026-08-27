import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_MAX_AGE, SESSION_COOKIE_NAME, signSessionToken, verifySessionToken } from "@/lib/auth/jwt";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Lê o token da sessão do header `Authorization: Bearer <token>` (para um futuro app
 * iOS/Android ou outro cliente de API) e, na ausência dele, do cookie httpOnly (web).
 * Funciona em Server Components, Server Actions e Route Handlers — todos têm acesso a
 * `cookies()`/`headers()` de `next/headers`.
 */
async function readSessionToken(): Promise<string | null> {
  const headerList = await headers();
  const authHeader = headerList.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await readSessionToken();
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true },
  });
  return user;
}

/** Para uso em Server Components/páginas: redireciona para /login em vez de retornar null. */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function createSession(userId: string, email: string): Promise<void> {
  const token = await signSessionToken({ sub: userId, email });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Emite um token para retorno em JSON — é isso que um app móvel guardaria e reenviaria via Bearer. */
export async function issueToken(userId: string, email: string): Promise<string> {
  return signSessionToken({ sub: userId, email });
}
