import { NextResponse } from "next/server";
import { authenticateUser, AuthError } from "@/lib/auth/service";
import { createSession, issueToken } from "@/lib/auth/session";
import { z } from "zod";
import { logAppError } from "@/lib/errors";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  try {
    const user = await authenticateUser(body);
    await createSession(user.id, user.email);
    const token = await issueToken(user.id, user.email);
    return NextResponse.json({ user, token });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    logAppError("api.auth.login", err);
    return NextResponse.json({ error: "Não foi possível entrar." }, { status: 500 });
  }
}
