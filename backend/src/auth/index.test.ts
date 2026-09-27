import { beforeEach, describe, expect, it, vi } from "vitest";

const { verifyIdToken, prismaMock } = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  prismaMock: {
    user: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("../firebase/admin", () => ({
  default: { auth: () => ({ verifyIdToken }) },
}));
vi.mock("../db", () => ({ prisma: prismaMock }));

import { verifyFirebaseTokenAndGetUser } from "./index";

describe("verifyFirebaseTokenAndGetUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("retorna null quando o token é inválido", async () => {
    verifyIdToken.mockRejectedValue(new Error("auth/argument-error"));
    await expect(
      verifyFirebaseTokenAndGetUser("Bearer ruim"),
    ).resolves.toBeNull();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("propaga erro de banco em vez de tratá-lo como não autenticado", async () => {
    verifyIdToken.mockResolvedValue({ uid: "u1", email: "admin@mail.com" });
    prismaMock.user.findUnique.mockRejectedValue(
      new Error("tenant/user not found"),
    );
    await expect(verifyFirebaseTokenAndGetUser("Bearer ok")).rejects.toThrow(
      "tenant/user not found",
    );
  });

  it("cria o usuário como COACH quando o email está na lista", async () => {
    verifyIdToken.mockResolvedValue({ uid: "u1", email: "admin@mail.com" });
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "db1", role: "COACH" });
    await expect(
      verifyFirebaseTokenAndGetUser("Bearer ok"),
    ).resolves.toMatchObject({
      uid: "u1",
      id: "db1",
      role: "COACH",
    });
  });
});
