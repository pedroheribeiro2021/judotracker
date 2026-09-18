import { describe, expect, it } from "vitest";
import { ForbiddenError } from "apollo-server";
import { promotionResolvers } from "./promotion";
import {
  createMockContext,
  athleteUser,
  asContext,
} from "../testUtils/mockContext";

describe("promotionResolvers authz", () => {
  it("recordPromotion lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      promotionResolvers.Mutation.recordPromotion(
        null,
        {
          input: {
            athleteId: "athlete-1",
            rank: "YELLOW",
            promotedAt: "2026-01-10",
          },
        },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.promotion.create).not.toHaveBeenCalled();
  });

  it("promotions lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      promotionResolvers.Query.promotions(
        null,
        { athleteId: "athlete-1" },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);
  });
});

describe("promotionResolvers.Query.promotions", () => {
  it("lista as graduações do atleta ordenadas da mais recente para a mais antiga", async () => {
    const mock = createMockContext();
    mock.prisma.promotion.findMany.mockResolvedValue([]);

    await promotionResolvers.Query.promotions(
      null,
      { athleteId: "athlete-1" },
      asContext(mock),
    );

    expect(mock.prisma.promotion.findMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
      orderBy: { promotedAt: "desc" },
    });
  });
});

describe("promotionResolvers.Mutation.recordPromotion", () => {
  it("cria a promoção convertendo a data", async () => {
    const mock = createMockContext();
    mock.prisma.promotion.create.mockResolvedValue({ id: "promo-1" } as any);

    await promotionResolvers.Mutation.recordPromotion(
      null,
      {
        input: {
          athleteId: "athlete-1",
          rank: "YELLOW",
          promotedAt: "2026-01-10T00:00:00.000Z",
          promotedBy: "Sensei João",
        },
      },
      asContext(mock),
    );

    const call = mock.prisma.promotion.create.mock.calls[0][0];
    expect(call.data.athleteId).toBe("athlete-1");
    expect(call.data.rank).toBe("YELLOW");
    expect(call.data.promotedAt).toEqual(new Date("2026-01-10T00:00:00.000Z"));
    expect(call.data.promotedBy).toBe("Sensei João");
  });
});

describe("promotionResolvers.Mutation.deletePromotion", () => {
  it("apaga a promoção", async () => {
    const mock = createMockContext();
    mock.prisma.promotion.delete.mockResolvedValue({ id: "promo-1" } as any);

    const result = await promotionResolvers.Mutation.deletePromotion(
      null,
      { id: "promo-1" },
      asContext(mock),
    );

    expect(mock.prisma.promotion.delete).toHaveBeenCalledWith({
      where: { id: "promo-1" },
    });
    expect(result).toBe(true);
  });
});

describe("promotionResolvers.Promotion field resolvers", () => {
  it("serializa promotedAt como ISO string", () => {
    const promotedAt = new Date("2026-01-10T00:00:00.000Z");
    expect(
      promotionResolvers.Promotion.promotedAt({ promotedAt } as any),
    ).toBe("2026-01-10T00:00:00.000Z");
  });
});

describe("promotionResolvers.Athlete.currentBelt", () => {
  it("retorna a faixa da promoção mais recente", async () => {
    const mock = createMockContext();
    mock.prisma.promotion.findFirst.mockResolvedValue({ rank: "GREEN" } as any);

    const result = await promotionResolvers.Athlete.currentBelt(
      { id: "athlete-1" } as any,
      null,
      asContext(mock),
    );

    expect(mock.prisma.promotion.findFirst).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
      orderBy: { promotedAt: "desc" },
    });
    expect(result).toBe("GREEN");
  });

  it("retorna null quando o atleta não tem promoções registradas", async () => {
    const mock = createMockContext();
    mock.prisma.promotion.findFirst.mockResolvedValue(null);

    const result = await promotionResolvers.Athlete.currentBelt(
      { id: "athlete-1" } as any,
      null,
      asContext(mock),
    );

    expect(result).toBeNull();
  });
});
