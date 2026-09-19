import { describe, expect, it } from "vitest";
import { getSportRules, listSportRules, JUDO_SPORT_ID } from "./registry";
import { judoRules } from "../judo/rules";

describe("sport registry", () => {
  it("resolve o judô pelo slug 'judo'", () => {
    expect(getSportRules("judo")).toBe(judoRules);
  });

  it("retorna undefined para um slug não registrado", () => {
    expect(getSportRules("bjj")).toBeUndefined();
  });

  it("lista todas as modalidades registradas", () => {
    expect(listSportRules()).toEqual([judoRules]);
  });

  it("JUDO_SPORT_ID é um uuid estável", () => {
    expect(JUDO_SPORT_ID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });
});

describe("judoRules", () => {
  it("expõe slug e nome", () => {
    expect(judoRules.slug).toBe("judo");
    expect(judoRules.name).toBe("Judô");
  });

  it("getWeightClasses delega para a tabela oficial CBJ", () => {
    const classes = judoRules.getWeightClasses("SENIOR", "M");
    expect(classes.map((c) => c.label)).toEqual([
      "-60",
      "-66",
      "-73",
      "-81",
      "-90",
      "-100",
      "+100",
    ]);
  });

  it("getWeightClasses retorna vazio para classe etária ou sexo desconhecidos", () => {
    expect(judoRules.getWeightClasses("MASTER", "M")).toEqual([]);
    expect(judoRules.getWeightClasses("SENIOR", "X")).toEqual([]);
  });

  it("getRankSystem retorna as 22 faixas na ordem oficial", () => {
    const ranks = judoRules.getRankSystem();
    expect(ranks).toHaveLength(22);
    expect(ranks[0]).toEqual({ rank: "WHITE", label: "Branca" });
    expect(ranks[ranks.length - 1].rank).toBe("RED_10DAN");
  });

  it("getMatchScoreTypes retorna as 6 formas de pontuação", () => {
    const scoreTypes = judoRules.getMatchScoreTypes();
    expect(scoreTypes).toHaveLength(6);
    expect(scoreTypes).toContainEqual({ code: "IPPON", label: "Ippon" });
  });
});
