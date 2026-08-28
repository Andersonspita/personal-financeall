import { describe, expect, it } from "vitest";
import { loginInputSchema, registerInputSchema } from "./schemas";
import { fieldErrorsFromZod } from "@/lib/errors";

describe("registerInputSchema", () => {
  it("rejeita nome em branco", () => {
    const parsed = registerInputSchema.safeParse({
      name: "   ",
      email: "ada@example.com",
      password: "12345678",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(fieldErrorsFromZod(parsed.error).name).toMatch(/nome/i);
  });

  it("rejeita e-mail inválido", () => {
    const parsed = registerInputSchema.safeParse({
      name: "Ada",
      email: "nao-e-email",
      password: "12345678",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(fieldErrorsFromZod(parsed.error).email).toMatch(/e-mail/i);
  });

  it("rejeita senha curta", () => {
    const parsed = registerInputSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "1234567",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(fieldErrorsFromZod(parsed.error).password).toMatch(/8 caracteres/i);
  });

  it("normaliza e-mail para minúsculas", () => {
    const parsed = registerInputSchema.parse({
      name: "Ada",
      email: "Ada@Example.COM",
      password: "12345678",
    });
    expect(parsed.email).toBe("ada@example.com");
  });
});

describe("loginInputSchema", () => {
  it("rejeita senha vazia sem vazar se o e-mail existe", () => {
    const parsed = loginInputSchema.safeParse({ email: "ada@example.com", password: "" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(fieldErrorsFromZod(parsed.error).password).toMatch(/senha/i);
  });
});
