import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

// Criptografia em repouso para os campos emocionais/sensíveis (RNF02: sigilo dos dados
// de saúde mental, dissociados dos relatórios financeiros). AES-256-GCM com chave derivada
// de EMOTION_ENCRYPTION_KEY (defina um segredo forte em .env — nunca use o valor de exemplo em produção).

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const secret = process.env.EMOTION_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "EMOTION_ENCRYPTION_KEY não configurada. Defina uma chave em .env para proteger dados emocionais.",
    );
  }
  return scryptSync(secret, "personal-financeall-emotion-salt", 32);
}

/** Criptografa texto sensível (ex: nota emocional). Retorna string base64 auto-contida (iv + authTag + ciphertext). */
export function encryptSensitive(plainText: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Reverte encryptSensitive. Lança erro se o payload foi adulterado (falha de autenticação GCM). */
export function decryptSensitive(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = raw.subarray(IV_LENGTH + 16);
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
