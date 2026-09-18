import { describe, expect, it } from "vitest";
import { BELT_RANKS, BELT_RANK_LABELS, BELT_RANK_REQUIREMENTS } from "./beltRanks";

describe("beltRanks", () => {
  it("tem 22 graduações, da branca à vermelha 10º Dan, sem duplicatas", () => {
    expect(BELT_RANKS).toHaveLength(22);
    expect(new Set(BELT_RANKS).size).toBe(BELT_RANKS.length);
    expect(BELT_RANKS[0]).toBe("WHITE");
    expect(BELT_RANKS[BELT_RANKS.length - 1]).toBe("RED_10DAN");
  });

  it("toda graduação tem rótulo e requisitos definidos", () => {
    for (const rank of BELT_RANKS) {
      expect(BELT_RANK_LABELS[rank]).toBeTruthy();
      expect(BELT_RANK_REQUIREMENTS[rank]).toBeDefined();
    }
  });

  it("idade mínima é estritamente crescente ao longo da progressão (exceto a branca inicial)", () => {
    const ages = BELT_RANKS.map((r) => BELT_RANK_REQUIREMENTS[r].minAge).filter(
      (a): a is number => a != null,
    );
    for (let i = 1; i < ages.length; i++) {
      expect(ages[i]).toBeGreaterThan(ages[i - 1]);
    }
  });
});
