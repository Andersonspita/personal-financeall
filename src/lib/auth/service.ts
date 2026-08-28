import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createDefaultDataForUser } from "@/lib/onboarding";
import {
  registerInputSchema,
  loginInputSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas";
import {
  createPasswordResetSecret,
  hashPasswordResetSecret,
  isPasswordResetUsable,
  PASSWORD_RESET_GENERIC_MESSAGE,
  PASSWORD_RESET_TTL_MS,
} from "@/lib/auth/reset-token";
import { sendPasswordResetMail, isMailConfigured } from "@/lib/mail";
import { logAppInfo } from "@/lib/errors";
import { appBaseUrl } from "@/lib/auth/config";
import type { GoogleProfile } from "@/lib/auth/google";

export {
  registerInputSchema,
  loginInputSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/auth/schemas";

export { PASSWORD_RESET_GENERIC_MESSAGE } from "@/lib/auth/reset-token";

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

  if (!user.passwordHash) {
    throw new AuthError("Esta conta entra com o Google. Use o botão Continuar com Google.");
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) throw new AuthError("E-mail ou senha incorretos.");

  return { id: user.id, email: user.email, name: user.name };
}

export async function requestPasswordReset(input: unknown, requestUrl?: string): Promise<{ message: string }> {
  const { email } = requestPasswordResetSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: PASSWORD_RESET_GENERIC_MESSAGE };

  const secret = createPasswordResetSecret();
  const tokenHash = hashPasswordResetSecret(secret);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetUrl = `${appBaseUrl(requestUrl)}/recuperar-senha/${encodeURIComponent(secret)}`;

  if (isMailConfigured()) {
    await sendPasswordResetMail({ to: user.email, resetUrl });
  } else {
    logAppInfo("auth.password-reset.dev-link", {
      email: user.email,
      resetUrl,
      hint: "Sem SMTP/Resend: o link só aparece neste log.",
    });
  }

  return { message: PASSWORD_RESET_GENERIC_MESSAGE };
}

export async function resetPasswordWithToken(input: unknown) {
  const data = resetPasswordSchema.parse(input);
  const tokenHash = hashPasswordResetSecret(data.token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!record || !isPasswordResetUsable(record)) {
    throw new AuthError("Este link expirou ou já foi usado. Peça um novo.");
  }

  const passwordHash = await hashPassword(data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return { id: record.user.id, email: record.user.email, name: record.user.name };
}

export async function upsertUserFromGoogle(profile: GoogleProfile) {
  const byGoogle = await prisma.user.findUnique({ where: { googleId: profile.googleId } });
  if (byGoogle) {
    return { id: byGoogle.id, email: byGoogle.email, name: byGoogle.name };
  }

  const byEmail = await prisma.user.findUnique({ where: { email: profile.email } });
  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== profile.googleId) {
      throw new AuthError("Este e-mail já está ligado a outra conta Google.");
    }
    const linked = await prisma.user.update({
      where: { id: byEmail.id },
      data: { googleId: profile.googleId },
      select: { id: true, email: true, name: true },
    });
    return linked;
  }

  const user = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.googleId,
    },
    select: { id: true, email: true, name: true },
  });
  await createDefaultDataForUser(user.id);
  return user;
}
