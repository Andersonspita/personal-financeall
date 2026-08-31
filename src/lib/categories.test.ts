import { describe, expect, it } from "vitest";
import { assertCanArchiveCategory, categoryKind } from "./categories";
import { DomainError } from "./errors";

describe("categoryKind", () => {
  it("separa renda de gasto", () => {
    expect(categoryKind("renda")).toBe("renda");
    expect(categoryKind("essencial")).toBe("gasto");
    expect(categoryKind("variavel")).toBe("gasto");
    expect(categoryKind("poupanca")).toBe("gasto");
  });
});

describe("assertCanArchiveCategory", () => {
  it("permite arquivar quando há mais de uma do mesmo tipo", () => {
    expect(() => assertCanArchiveCategory("renda", 2)).not.toThrow();
    expect(() => assertCanArchiveCategory("gasto", 3)).not.toThrow();
  });

  it("impede arquivar a última de renda ou de gasto", () => {
    expect(() => assertCanArchiveCategory("renda", 1)).toThrow(DomainError);
    expect(() => assertCanArchiveCategory("gasto", 1)).toThrow(DomainError);
  });
});
