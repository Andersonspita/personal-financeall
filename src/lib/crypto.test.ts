import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.EMOTION_ENCRYPTION_KEY ??= "vitest-emotion-encryption-key";
});

describe("encryptSensitive / decryptSensitive", () => {
  it("volta o texto original", async () => {
    const { encryptSensitive, decryptSensitive } = await import("./crypto");
    const plain = "ansioso depois do expediente";
    expect(decryptSensitive(encryptSensitive(plain))).toBe(plain);
  });

  it("rejeita payload adulterado", async () => {
    const { encryptSensitive, decryptSensitive } = await import("./crypto");
    const payload = encryptSensitive("nota privada");
    const raw = Buffer.from(payload, "base64");
    raw[raw.length - 1] = raw[raw.length - 1] ^ 0xff;
    expect(() => decryptSensitive(raw.toString("base64"))).toThrow();
  });

  it("rejeita string vazia que não é um envelope GCM", async () => {
    const { decryptSensitive } = await import("./crypto");
    expect(() => decryptSensitive("")).toThrow();
    expect(() => decryptSensitive("não-é-base64-válido???")).toThrow();
  });
});
