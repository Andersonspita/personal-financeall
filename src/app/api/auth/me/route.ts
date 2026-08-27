import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

// Um app móvel usa isso para validar o token guardado localmente e recuperar o usuário atual.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  return NextResponse.json({ user });
}
