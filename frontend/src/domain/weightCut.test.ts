import { describe, expect, it } from "vitest";
import { formatWeightCutMessage, getWeightCutExcessKg } from "./weightCut";

describe("getWeightCutExcessKg", () => {
  it("retorna o excedente quando o peso ultrapassa o teto da categoria", () => {
    expect(getWeightCutExcessKg("-73", 74.4)).toBeCloseTo(1.4);
  });

  it("retorna null quando o peso está dentro do limite", () => {
    expect(getWeightCutExcessKg("-73", 73)).toBeNull();
  });

  it("retorna null para categorias abertas ('+X')", () => {
    expect(getWeightCutExcessKg("+100", 150)).toBeNull();
  });

  it("retorna null sem categoria ou sem pesagem", () => {
    expect(getWeightCutExcessKg(null, 74)).toBeNull();
    expect(getWeightCutExcessKg("-73", null)).toBeNull();
  });
});

describe("formatWeightCutMessage", () => {
  it("formata com vírgula decimal, no padrão pt-BR", () => {
    expect(formatWeightCutMessage(1.4, "-73")).toBe("+1,4 kg acima de -73");
  });
});
