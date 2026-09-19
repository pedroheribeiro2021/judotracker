import { describe, expect, it } from "vitest";
import { ForbiddenError } from "apollo-server";
import { athleteResolvers } from "./athlete";
import { createMockContext, athleteUser, asContext } from "../testUtils/mockContext";

const DOB_SENIOR = "2000-05-10"; // referência: sempre 21+ anos em qualquer ano de teste razoável

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

describe("athleteResolvers.Query.athlete authz", () => {
  it("permite COACH consultar qualquer atleta", async () => {
    const mock = createMockContext();
    mock.prisma.athlete.findUnique.mockResolvedValue({ id: "athlete-1" } as any);

    await expect(
      athleteResolvers.Query.athlete(null, { id: "athlete-1" }, asContext(mock)),
    ).resolves.toEqual({ id: "athlete-1" });
  });

  it("permite ATHLETE consultar o próprio registro", async () => {
    const mock = createMockContext(athleteUser);
    mock.prisma.athlete.findUnique.mockResolvedValue({
      id: "athlete-1",
      userId: athleteUser.id,
    } as any);

    await expect(
      athleteResolvers.Query.athlete(null, { id: "athlete-1" }, asContext(mock)),
    ).resolves.toEqual({ id: "athlete-1", userId: athleteUser.id });
  });

  it("lança ForbiddenError para ATHLETE consultando outro atleta", async () => {
    const mock = createMockContext(athleteUser);
    mock.prisma.athlete.findUnique.mockResolvedValue({
      id: "athlete-2",
      userId: "outro-user",
    } as any);

    await expect(
      athleteResolvers.Query.athlete(null, { id: "athlete-2" }, asContext(mock)),
    ).rejects.toThrow(ForbiddenError);
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
    expect(mock.prisma.match.deleteMany).toHaveBeenCalledWith({
      where: { entry: { athleteId: "athlete-1" } },
    });
    expect(mock.prisma.entry.deleteMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
    });
    expect(mock.prisma.promotion.deleteMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
    });
    expect(mock.prisma.attendance.deleteMany).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
    });
    expect(mock.prisma.injury.deleteMany).toHaveBeenCalledWith({
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

describe("athleteResolvers.Athlete.ageDivision / currentWeightClass", () => {
  it("ageDivision é null sem data de nascimento", () => {
    expect(athleteResolvers.Athlete.ageDivision({ dob: null } as any)).toBeNull();
  });

  it("ageDivision calcula a classe etária pela data de nascimento", () => {
    expect(
      athleteResolvers.Athlete.ageDivision({ dob: DOB_SENIOR } as any),
    ).toBe("SENIOR");
  });

  it("currentWeightClass é null sem sexo cadastrado", async () => {
    const mock = createMockContext();

    const result = await athleteResolvers.Athlete.currentWeightClass(
      { id: "athlete-1", dob: DOB_SENIOR, sex: null } as any,
      null,
      asContext(mock),
    );

    expect(result).toBeNull();
    expect(mock.prisma.weighIn.findFirst).not.toHaveBeenCalled();
  });

  it("currentWeightClass usa a pesagem mais recente quando disponível", async () => {
    const mock = createMockContext();
    mock.prisma.weighIn.findFirst.mockResolvedValue({ weightKg: 74 } as any);

    const result = await athleteResolvers.Athlete.currentWeightClass(
      {
        id: "athlete-1",
        dob: DOB_SENIOR,
        sex: "M",
        defaultWeightKg: 90,
      } as any,
      null,
      asContext(mock),
    );

    expect(mock.prisma.weighIn.findFirst).toHaveBeenCalledWith({
      where: { athleteId: "athlete-1" },
      orderBy: { recordedAt: "desc" },
    });
    expect(result).toBe("-81");
  });

  it("currentWeightClass usa defaultWeightKg quando não há pesagens", async () => {
    const mock = createMockContext();
    mock.prisma.weighIn.findFirst.mockResolvedValue(null);

    const result = await athleteResolvers.Athlete.currentWeightClass(
      { id: "athlete-1", dob: DOB_SENIOR, sex: "M", defaultWeightKg: 73 } as any,
      null,
      asContext(mock),
    );

    expect(result).toBe("-73");
  });

  it("lastWeighInKg retorna o peso da pesagem mais recente, com fallback para defaultWeightKg", async () => {
    const mock = createMockContext();
    mock.prisma.weighIn.findFirst.mockResolvedValueOnce({ weightKg: 74.5 } as any);

    await expect(
      athleteResolvers.Athlete.lastWeighInKg(
        { id: "athlete-1", defaultWeightKg: 73 } as any,
        null,
        asContext(mock),
      ),
    ).resolves.toBe(74.5);

    mock.prisma.weighIn.findFirst.mockResolvedValueOnce(null);
    await expect(
      athleteResolvers.Athlete.lastWeighInKg(
        { id: "athlete-1", defaultWeightKg: 73 } as any,
        null,
        asContext(mock),
      ),
    ).resolves.toBe(73);
  });
});
