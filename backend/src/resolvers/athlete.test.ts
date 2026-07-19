import { describe, expect, it } from "vitest";
import { ForbiddenError } from "apollo-server";
import { athleteResolvers } from "./athlete";
import { createMockContext, athleteUser, asContext } from "../testUtils/mockContext";

describe("athleteResolvers authz", () => {
  it("createAthlete lança ForbiddenError para currentUser sem role COACH/ADMIN", async () => {
    const mock = createMockContext(athleteUser);

    await expect(
      athleteResolvers.Mutation.createAthlete(
        null,
        { input: { email: "a@mail.com" } },
        asContext(mock),
      ),
    ).rejects.toThrow(ForbiddenError);

    expect(mock.prisma.user.create).not.toHaveBeenCalled();
  });
});

describe("athleteResolvers.Mutation.createAthlete", () => {
  it("cria o User e o Athlete vinculado", async () => {
    const mock = createMockContext();
    mock.prisma.user.create.mockResolvedValue({
      id: "user-1",
      email: "a@mail.com",
      name: null,
      role: "ATHLETE",
      passwordHash: null,
      firebaseUid: null,
      createdAt: new Date(),
    } as any);
    mock.prisma.athlete.create.mockResolvedValue({ id: "athlete-1" } as any);

    const result = await athleteResolvers.Mutation.createAthlete(
      null,
      { input: { email: "a@mail.com", heightCm: 170 } },
      asContext(mock),
    );

    expect(mock.prisma.user.create).toHaveBeenCalledWith({
      data: { email: "a@mail.com", name: null, role: "ATHLETE" },
    });
    expect(mock.prisma.athlete.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", heightCm: 170 }),
      }),
    );
    expect(result).toEqual({ id: "athlete-1" });
  });
});

describe("athleteResolvers.Mutation.updateAthlete (edição parcial)", () => {
  it("não sobrescreve coachId quando o campo não é enviado no input", async () => {
    const mock = createMockContext();
    mock.prisma.athlete.update.mockResolvedValue({ id: "athlete-1" } as any);

    await athleteResolvers.Mutation.updateAthlete(
      null,
      { input: { id: "athlete-1", heightCm: 180 } },
      asContext(mock),
    );

    const call = mock.prisma.athlete.update.mock.calls[0][0];
    expect(call.data.coachId).toBeUndefined();
    expect(call.data.heightCm).toBe(180);
  });

  it("desvincula o treinador quando coachId é enviado explicitamente como null", async () => {
    const mock = createMockContext();
    mock.prisma.athlete.update.mockResolvedValue({ id: "athlete-1" } as any);

    await athleteResolvers.Mutation.updateAthlete(
      null,
      { input: { id: "athlete-1", coachId: null } },
      asContext(mock),
    );

    const call = mock.prisma.athlete.update.mock.calls[0][0];
    expect(call.data.coachId).toBeNull();
  });

  it("atualiza coachId quando um novo id é enviado", async () => {
    const mock = createMockContext();
    mock.prisma.athlete.update.mockResolvedValue({ id: "athlete-1" } as any);

    await athleteResolvers.Mutation.updateAthlete(
      null,
      { input: { id: "athlete-1", coachId: "coach-2" } },
      asContext(mock),
    );

    const call = mock.prisma.athlete.update.mock.calls[0][0];
    expect(call.data.coachId).toBe("coach-2");
  });
});

describe("athleteResolvers.Mutation.deleteAthlete", () => {
  it("lança erro quando o atleta não existe", async () => {
    const mock = createMockContext();
    mock.prisma.athlete.findUnique.mockResolvedValue(null);

    await expect(
      athleteResolvers.Mutation.deleteAthlete(
        null,
        { id: "missing" },
        asContext(mock),
      ),
    ).rejects.toThrow("Atleta não encontrado");
  });

  it("apaga pesagens, medições, inscrições, atleta e usuário em transação", async () => {
    const mock = createMockContext();
    mock.prisma.athlete.findUnique.mockResolvedValue({
      id: "athlete-1",
      userId: "user-1",
    } as any);
    mock.prisma.$transaction.mockImplementation((cb: any) => cb(mock.prisma));

    const result = await athleteResolvers.Mutation.deleteAthlete(
      null,
      { id: "athlete-1" },
      asContext(mock),
    );

    expect(mock.prisma.weighIn.deleteMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
    });
    expect(mock.prisma.bodyMeasurement.deleteMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
    });
    expect(mock.prisma.entry.deleteMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
    });
    expect(mock.prisma.athlete.delete).toHaveBeenCalledWith({
      where: { id: "athlete-1" },
    });
    expect(mock.prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(result).toBe(true);
  });
});
