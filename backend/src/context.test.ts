import { describe, expect, it } from "vitest";
import { AuthenticationError, ForbiddenError } from "apollo-server";
import { requireAuth, requireCoach, Context } from "./context";

function ctxWithUser(role: string | null | undefined): Context {
  return {
    prisma: {} as any,
    currentUser: role === null ? null : { uid: "u1", role },
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
