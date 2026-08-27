import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createDefaultDataForUser } from "@/lib/onboarding";

// Lógica de negócio de autenticação centralizada aqui e reutilizada tanto pelas Server Actions
// (formulários da web) quanto pelas rotas /api/auth/* (pensadas para um futuro cliente móvel) —
// um único caminho de validação, sem duplicar regras entre os dois pontos de entrada.

export const registerInputSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(200),
});

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});

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
