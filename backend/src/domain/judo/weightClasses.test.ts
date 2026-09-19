import { describe, expect, it } from "vitest";
import { getAgeDivision, getWeightClass } from "./weightClasses";

describe("getAgeDivision", () => {
  it("classifica pela idade completada no ano civil da referência, não por idade exata em dias", () => {
    // nascido em 2012, referência em 2025 -> 13 anos completados no ano -> Sub-15
    expect(getAgeDivision(new Date("2012-12-30"), new Date("2025-01-05"))).toBe(
      "SUB15",
    );
  });

  it("Sub-13 para até 12 anos completados no ano", () => {
    expect(getAgeDivision(new Date("2013-05-10"), new Date("2025-06-01"))).toBe(
      "SUB13",
    );
  });

  it("Sub-15 para 13-14 anos completados no ano", () => {
    expect(getAgeDivision(new Date("2011-05-10"), new Date("2025-06-01"))).toBe(
      "SUB15",
    );
  });

  it("Sub-18 para 15-17 anos completados no ano", () => {
    expect(getAgeDivision(new Date("2008-05-10"), new Date("2025-06-01"))).toBe(
      "SUB18",
    );
  });

  it("Sub-21 para 18-20 anos completados no ano", () => {
    expect(getAgeDivision(new Date("2005-05-10"), new Date("2025-06-01"))).toBe(
      "SUB21",
    );
  });

  it("Sênior para 21+ anos completados no ano", () => {
    expect(getAgeDivision(new Date("2000-05-10"), new Date("2025-06-01"))).toBe(
      "SENIOR",
    );
  });
});

describe("getWeightClass", () => {
  it("Sênior masculino segue -60,-66,-73,-81,-90,-100,+100", () => {
    expect(getWeightClass(59, "SENIOR", "M")).toBe("-60");
    expect(getWeightClass(60, "SENIOR", "M")).toBe("-60");
    expect(getWeightClass(60.1, "SENIOR", "M")).toBe("-66");
    expect(getWeightClass(73, "SENIOR", "M")).toBe("-73");
    expect(getWeightClass(73.1, "SENIOR", "M")).toBe("-81");
    expect(getWeightClass(150, "SENIOR", "M")).toBe("+100");
  });

  it("Sênior feminino segue -48,-52,-57,-63,-70,-78,+78", () => {
    expect(getWeightClass(48, "SENIOR", "F")).toBe("-48");
    expect(getWeightClass(63, "SENIOR", "F")).toBe("-63");
    expect(getWeightClass(78, "SENIOR", "F")).toBe("-78");
    expect(getWeightClass(78.1, "SENIOR", "F")).toBe("+78");
  });

  it("Sub-13 usa a mesma tabela para masculino e feminino", () => {
    expect(getWeightClass(30, "SUB13", "M")).toBe("-31");
    expect(getWeightClass(30, "SUB13", "F")).toBe("-31");
    expect(getWeightClass(61, "SUB13", "M")).toBe("+60");
  });

  it("Sub-18 masculino (cadete) não tem faixa 'super pesado' separada", () => {
    expect(getWeightClass(90, "SUB18", "M")).toBe("-90");
    expect(getWeightClass(90.1, "SUB18", "M")).toBe("+90");
  });
});
