import { describe, expect, it } from "vitest";
import { formatDateOnly, formatDecimal, toDateOnly } from "./dates";

describe("toDateOnly / formatDateOnly", () => {
  it("mantém o dia gravado em meia-noite UTC, qualquer que seja o fuso", () => {
    expect(formatDateOnly("1997-11-02T00:00:00.000Z")).toBe("02/11/1997");
    const d = toDateOnly("2026-10-25T00:00:00.000Z")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 25]);
  });

  it("aceita timestamp numérico (inclusive como string)", () => {
    const ms = Date.UTC(2003, 4, 18);
    expect(formatDateOnly(ms)).toBe("18/05/2003");
    expect(formatDateOnly(String(ms))).toBe("18/05/2003");
  });

  it("retorna '-' para vazio ou inválido", () => {
    expect(formatDateOnly(null)).toBe("-");
    expect(formatDateOnly("")).toBe("-");
    expect(formatDateOnly("não é data")).toBe("-");
  });

  it("formata em português", () => {
    expect(formatDateOnly("2026-10-25T00:00:00.000Z", "d 'de' MMMM")).toBe(
      "25 de outubro",
    );
  });
});

describe("formatDecimal", () => {
  it("usa vírgula decimal", () => {
    expect(formatDecimal(33.3)).toBe("33,3");
    expect(formatDecimal(0.6667, 2)).toBe("0,67");
    expect(formatDecimal(12)).toBe("12");
  });
});
