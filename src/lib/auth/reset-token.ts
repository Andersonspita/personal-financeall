import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export const PASSWORD_RESET_GENERIC_MESSAGE =
  "Se este e-mail estiver cadastrado, você receberá um link para definir uma nova senha.";

export function createPasswordResetSecret(): string {
  return randomBytes(32).toString("base64url");
}

export function hashPasswordResetSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function isPasswordResetUsable(input: {
  expiresAt: Date;
  usedAt: Date | null;
  now?: Date;
}): boolean {
  if (input.usedAt) return false;
  return input.expiresAt.getTime() > (input.now ?? new Date()).getTime();
}
