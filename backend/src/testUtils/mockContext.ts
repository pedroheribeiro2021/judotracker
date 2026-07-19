import { vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { Context } from "../context";
import type { CurrentUser } from "../auth/index";

// Mock manual (em vez de vitest-mock-extended): os pacotes de "deep mock" da
// biblioteca publicam tipos ESM sem `.d.cts` correspondente, o que quebra a
// resolução de tipos deste projeto sob moduleResolution "NodeNext". Como os
// resolvers só tocam um punhado de métodos do Prisma, um mock manual e
// tipado à mão é mais simples e não depende dessa peça extra.
function createMockPrisma() {
  return {
    user: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    athlete: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    coach: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    weighIn: {
      create: vi.fn(),
      findMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    bodyMeasurement: {
      deleteMany: vi.fn(),
    },
    entry: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;

export type MockContext = {
  prisma: MockPrisma;
  currentUser: CurrentUser | null;
};

export function createMockContext(
  currentUser: CurrentUser | null = {
    uid: "firebase-uid-coach",
    email: "coach@mail.com",
    name: "Coach",
    role: "COACH",
    id: "user-coach-id",
  },
): MockContext {
  return {
    prisma: createMockPrisma(),
    currentUser,
  };
}

export const athleteUser: CurrentUser = {
  uid: "firebase-uid-athlete",
  email: "athlete@mail.com",
  name: "Athlete",
  role: "ATHLETE",
  id: "user-athlete-id",
};

export function asContext(mock: MockContext): Context {
  return {
    prisma: mock.prisma as unknown as PrismaClient,
    currentUser: mock.currentUser,
  };
}
