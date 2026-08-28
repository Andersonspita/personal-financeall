import { describe, expect, it } from "vitest";
import {
  createPasswordResetSecret,
  hashPasswordResetSecret,
  isPasswordResetUsable,
} from "./reset-token";
import { pkceChallenge } from "./google";
import { requestPasswordResetSchema, resetPasswordSchema } from "./schemas";

describe("password reset token", () => {
  it("o hash é determinístico e não devolve o segredo", () => {
    const secret = createPasswordResetSecret();
    expect(secret).not.toBe(hashPasswordResetSecret(secret));
    expect(hashPasswordResetSecret(secret)).toBe(hashPasswordResetSecret(secret));
  });

  it("rejeita token já usado ou expirado", () => {
    const now = new Date("2026-08-28T12:00:00Z");
    expect(
      isPasswordResetUsable({ expiresAt: new Date("2026-08-28T13:00:00Z"), usedAt: null, now }),
    ).toBe(true);
    expect(
      isPasswordResetUsable({
        expiresAt: new Date("2026-08-28T13:00:00Z"),
        usedAt: new Date("2026-08-28T12:01:00Z"),
        now,
      }),
    ).toBe(false);
    expect(
      isPasswordResetUsable({ expiresAt: new Date("2026-08-28T11:00:00Z"), usedAt: null, now }),
    ).toBe(false);
  });
});

describe("reset schemas", () => {
  it("não aceita token curto nem senha curta", () => {
    expect(resetPasswordSchema.safeParse({ token: "abc", password: "12345678" }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ token: "a".repeat(20), password: "1234567" }).success).toBe(false);
  });

  it("pedido de reset exige e-mail válido", () => {
    expect(requestPasswordResetSchema.safeParse({ email: "nao" }).success).toBe(false);
    expect(requestPasswordResetSchema.parse({ email: "Ada@Example.com" }).email).toBe("ada@example.com");
  });
});

describe("pkceChallenge", () => {
  it("é estável para o mesmo verifier", () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    expect(pkceChallenge(verifier)).toBe(pkceChallenge(verifier));
    expect(pkceChallenge(verifier)).not.toBe(verifier);
  });
});
