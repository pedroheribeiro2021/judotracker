import { describe, expect, it, vi } from "vitest";
import { ForbiddenError } from "apollo-server";
import { weighInResolvers } from "./weighIn";
import { createMockContext, athleteUser, asContext } from "../testUtils/mockContext";

describe("weighInResolvers.Mutation.recordWeighIn", () => {
  it("lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      weighInResolvers.Mutation.recordWeighIn(
        null,
        { input: { athleteId: "athlete-1", weightKg: 73 } },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.weighIn.create).not.toHaveBeenCalled();
  });

  it("usa a data informada e devolve recordedAt como ISO string", async () => {
    const mock = createMockContext();
    const recordedAt = new Date("2026-01-10T12:00:00.000Z");
    mock.prisma.weighIn.create.mockResolvedValue({
      id: "wi-1",
      athleteId: "athlete-1",
      weightKg: 73.4,
      recordedAt,
      notes: null,
      createdAt: recordedAt,
    } as any);

    const result = await weighInResolvers.Mutation.recordWeighIn(
      null,
      {
        input: {
          athleteId: "athlete-1",
          weightKg: 73.4,
          recordedAt: "2026-01-10T12:00:00.000Z",
        },
      },
      asContext(mock),
    );

    expect(mock.prisma.weighIn.create).toHaveBeenCalledWith({
      data: {
        athleteId: "athlete-1",
        weightKg: 73.4,
        recordedAt,
        notes: undefined,
      },
    });
    expect(result.recordedAt).toBe("2026-01-10T12:00:00.000Z");
  });

  it("usa a data atual quando recordedAt não é informado", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-01T00:00:00.000Z"));

    const mock = createMockContext();
    mock.prisma.weighIn.create.mockResolvedValue({
      id: "wi-2",
      athleteId: "athlete-1",
      weightKg: 70,
      recordedAt: new Date(),
      notes: null,
      createdAt: new Date(),
    } as any);

    await weighInResolvers.Mutation.recordWeighIn(
      null,
      { input: { athleteId: "athlete-1", weightKg: 70 } },
      asContext(mock),
    );

    const call = mock.prisma.weighIn.create.mock.calls[0][0];
    expect(call.data.recordedAt).toEqual(new Date("2026-02-01T00:00:00.000Z"));

    vi.useRealTimers();
  });
});
