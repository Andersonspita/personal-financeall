import { describe, expect, it } from "vitest";
import { assertCanArchiveAccount } from "./accounts";
import { DomainError } from "./errors";

describe("assertCanArchiveAccount", () => {
  it("permite arquivar quando há mais de uma conta ativa", () => {
    expect(() => assertCanArchiveAccount(2)).not.toThrow();
  });

  it("impede arquivar a última conta ativa", () => {
    expect(() => assertCanArchiveAccount(1)).toThrow(DomainError);
    expect(() => assertCanArchiveAccount(0)).toThrow(DomainError);
  });
});
