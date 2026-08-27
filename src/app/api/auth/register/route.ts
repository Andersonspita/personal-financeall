import { NextResponse } from "next/server";
import { registerUser, AuthError } from "@/lib/auth/service";
import { createSession, issueToken } from "@/lib/auth/session";
import { z } from "zod";

// Rota pensada para um cliente que não é o navegador (app iOS/Android): recebe JSON e devolve
// um token no corpo da resposta, além de também setar o cookie httpOnly (caso o chamador seja
// a própria web via fetch). O mesmo backend serve os dois tipos de cliente sem duplicação.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido." }, { status: 400 });

  try {
    const user = await registerUser(body);
    await createSession(user.id, user.email);
    const token = await issueToken(user.id, user.email);
    return NextResponse.json({ user, token }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 409 });
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
  }
}
