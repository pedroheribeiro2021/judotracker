import { describe, expect, it, vi } from "vitest";
import { AuthenticationError, ForbiddenError } from "apollo-server";
import { requireAuth, requireCoach, requireSelfOrCoach, Context } from "./context";

function ctxWithUser(
  role: string | null | undefined,
  extra: Record<string, any> = {},
): Context {
  return {
    prisma: {} as any,
    currentUser: role === null ? null : { uid: "u1", role, ...extra },
  };
}

describe("requireAuth", () => {
  it("passa quando há um currentUser", () => {
    expect(() => requireAuth(ctxWithUser("ATHLETE"))).not.toThrow();
  });

  it("lança AuthenticationError quando não há currentUser", () => {
    expect(() => requireAuth(ctxWithUser(null))).toThrow(AuthenticationError);
  });
});

describe("requireCoach", () => {
  it("passa para role COACH", () => {
    expect(() => requireCoach(ctxWithUser("COACH"))).not.toThrow();
  });

  it("passa para role ADMIN", () => {
    expect(() => requireCoach(ctxWithUser("ADMIN"))).not.toThrow();
  });

  it("lança ForbiddenError para role ATHLETE", () => {
    expect(() => requireCoach(ctxWithUser("ATHLETE"))).toThrow(
      ForbiddenError,
    );
  });

  it("lança AuthenticationError quando não autenticado (antes de checar role)", () => {
    expect(() => requireCoach(ctxWithUser(null))).toThrow(
      AuthenticationError,
    );
  });
});

describe("requireSelfOrCoach", () => {
  it("passa para role COACH mesmo sem ser o próprio atleta", async () => {
    const ctx = ctxWithUser("COACH", { id: "user-coach" });
    await expect(
      requireSelfOrCoach(ctx, "athlete-1"),
    ).resolves.toBeUndefined();
  });

  it("passa para o próprio ATHLETE (Athlete.userId === currentUser.id)", async () => {
    const ctx = ctxWithUser("ATHLETE", { id: "user-athlete" });
    ctx.prisma = {
      athlete: {
        findUnique: vi.fn().mockResolvedValue({
          id: "athlete-1",
          userId: "user-athlete",
        }),
      },
    } as any;

    await expect(
      requireSelfOrCoach(ctx, "athlete-1"),
    ).resolves.toBeUndefined();
  });

  it("lança ForbiddenError para ATHLETE tentando acessar outro atleta", async () => {
    const ctx = ctxWithUser("ATHLETE", { id: "user-athlete" });
    ctx.prisma = {
      athlete: {
        findUnique: vi.fn().mockResolvedValue({
          id: "athlete-2",
          userId: "outro-user",
        }),
      },
    } as any;

    await expect(requireSelfOrCoach(ctx, "athlete-2")).rejects.toThrow(
      ForbiddenError,
    );
  });

  it("lança AuthenticationError quando não autenticado", async () => {
    await expect(
      requireSelfOrCoach(ctxWithUser(null), "athlete-1"),
    ).rejects.toThrow(AuthenticationError);
  });
});
