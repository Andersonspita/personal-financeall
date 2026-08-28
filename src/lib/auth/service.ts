import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createDefaultDataForUser } from "@/lib/onboarding";
import { registerInputSchema, loginInputSchema } from "@/lib/auth/schemas";

export { registerInputSchema, loginInputSchema } from "@/lib/auth/schemas";

// Um único caminho de validação e hash, reutilizado pelas Server Actions e por /api/auth/*
// (cliente móvel futuro) — evita regras diferentes nos dois pontos de entrada.

export class AuthError extends Error {}

export async function registerUser(input: unknown) {
  const data = registerInputSchema.parse(input);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AuthError("Já existe uma conta com esse e-mail.");

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash },
    select: { id: true, email: true, name: true },
  });
  await createDefaultDataForUser(user.id);
  return user;
}

export async function authenticateUser(input: unknown) {
  const data = loginInputSchema.parse(input);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new AuthError("E-mail ou senha incorretos.");

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) throw new AuthError("E-mail ou senha incorretos.");

  return { id: user.id, email: user.email, name: user.name };
}
