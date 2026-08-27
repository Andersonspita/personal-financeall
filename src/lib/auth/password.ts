import bcrypt from "bcryptjs";

// bcryptjs (puro JS) em vez de bcrypt nativo: evita o mesmo tipo de dor de binding nativo
// já enfrentada com o zen-engine neste projeto, sem custo relevante na escala de um app pessoal.
const SALT_ROUNDS = 12;

export function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
