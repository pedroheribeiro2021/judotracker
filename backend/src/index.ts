// backend/src/index.ts
import "dotenv/config";
import {
  ApolloServer,
  gql,
  AuthenticationError,
  ForbiddenError,
} from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { verifyFirebaseTokenAndGetUser } from "./auth/index";

const prisma = new PrismaClient();

// Helper: throws if not authenticated
function requireAuth(ctx: any) {
  if (!ctx.currentUser) throw new AuthenticationError("Not authenticated");
}

// Helper: throws if not COACH role (admin)
// backend/src/index.ts
function requireCoach(ctx: any) {
  requireAuth(ctx);
  if (ctx.currentUser.role !== "COACH" && ctx.currentUser.role !== "ADMIN") {
    throw new ForbiddenError("Acesso restrito a treinadores");
  }
}

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    role: String!
    createdAt: String!
    athlete: Athlete
    coach: Coach
  }

  type Athlete {
    id: ID!
    userId: ID!
    user: User
    dob: String
    heightCm: Float
    defaultWeightKg: Float
    coach: Coach
    coachId: ID
    createdAt: String!
  }

  type Coach {
    id: ID!
    userId: ID!
    user: User
    athletes: [Athlete!]!
    createdAt: String!
  }

  type WeighIn {
    id: ID!
    athleteId: ID!
    weightKg: Float!
    recordedAt: String!
    notes: String
  }

  input CreateAthleteInput {
    email: String!
    name: String
    dob: String
    heightCm: Float
    defaultWeightKg: Float
    coachId: ID
  }

  input RecordWeighInInput {
    athleteId: ID!
    weightKg: Float!
    recordedAt: String
    notes: String
  }

  input CreateCoachInput {
    email: String!
    name: String
  }

  input UpdateAthleteInput {
    id: ID!
    coachId: ID
    heightCm: Float
    defaultWeightKg: Float
  }

  type Query {
    athletes: [Athlete!]!
    athlete(id: ID!): Athlete
    weighIns(athleteId: ID!): [WeighIn!]!
    coaches: [Coach!]!
    me: User
  }

  type Mutation {
    createAthlete(input: CreateAthleteInput!): Athlete!
    recordWeighIn(input: RecordWeighInInput!): WeighIn!
    createCoach(input: CreateCoachInput!): Coach!
    updateAthlete(input: UpdateAthleteInput!): Athlete!
    deleteAthlete(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    // COACH only: list all athletes
    athletes: async (_: any, __: any, ctx: any) => {
      requireCoach(ctx);
      return prisma.athlete.findMany({
        include: {
          user: true,
          coach: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },

    // COACH only: single athlete detail
    athlete: async (_: any, { id }: { id: string }, ctx: any) => {
      requireCoach(ctx);
      return prisma.athlete.findUnique({
        where: { id },
        include: {
          user: true,
          coach: { include: { user: true } },
        },
      });
    },

    // COACH only: weigh-ins
    weighIns: async (
      _: any,
      { athleteId }: { athleteId: string },
      ctx: any,
    ) => {
      requireCoach(ctx);
      const rows = await prisma.weighIn.findMany({
        where: { athleteId },
        orderBy: { recordedAt: "desc" },
      });
      return rows.map((r: { recordedAt: Date } & Record<string, any>) => ({
        ...r,
        recordedAt: r.recordedAt.toISOString(),
      }));
    },

    // COACH only: list coaches
    coaches: async (_: any, __: any, ctx: any) => {
      requireCoach(ctx);
      return prisma.coach.findMany({
        include: {
          user: true,
          athletes: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },

    // Any authenticated user: returns own user data
    me: async (_: any, __: any, ctx: any) => {
      requireAuth(ctx);
      if (!ctx.currentUser.id) return null;
      return prisma.user.findUnique({ where: { id: ctx.currentUser.id } });
    },
  },

  Mutation: {
    // COACH only: create athlete
    createAthlete: async (_: any, { input }: any, ctx: any) => {
      requireCoach(ctx);
      const user = await prisma.user.create({
        data: { email: input.email, name: input.name ?? null, role: "ATHLETE" },
      });
      return prisma.athlete.create({
        data: {
          userId: user.id,
          dob: input.dob ? new Date(input.dob) : undefined,
          heightCm: input.heightCm,
          defaultWeightKg: input.defaultWeightKg,
          coachId: input.coachId || null,
        },
        include: {
          user: true,
          coach: { include: { user: true } },
        },
      });
    },

    // COACH only: record weigh-in
    recordWeighIn: async (_: any, { input }: any, ctx: any) => {
      requireCoach(ctx);
      const wi = await prisma.weighIn.create({
        data: {
          athleteId: input.athleteId,
          weightKg: input.weightKg,
          recordedAt: input.recordedAt
            ? new Date(input.recordedAt)
            : new Date(),
          notes: input.notes,
        },
      });
      return { ...wi, recordedAt: wi.recordedAt.toISOString() };
    },

    // COACH only: create coach
    createCoach: async (_: any, { input }: any, ctx: any) => {
      requireCoach(ctx);
      const user = await prisma.user.create({
        data: { email: input.email, name: input.name ?? null, role: "COACH" },
      });
      return prisma.coach.create({
        data: { userId: user.id },
        include: {
          user: true,
          athletes: { include: { user: true } },
        },
      });
    },

    // COACH only: update athlete
    updateAthlete: async (_: any, { input }: any, ctx: any) => {
      requireCoach(ctx);
      return prisma.athlete.update({
        where: { id: input.id },
        data: {
          coachId: input.coachId || null,
          heightCm: input.heightCm,
          defaultWeightKg: input.defaultWeightKg,
        },
        include: {
          user: true,
          coach: { include: { user: true } },
        },
      });
    },

    deleteAthlete: async (_: any, { id }: { id: string }, ctx: any) => {
      requireCoach(ctx);

      // Verificar se o atleta existe
      const athlete = await prisma.athlete.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!athlete) {
        throw new Error("Atleta não encontrado");
      }

      // Deletar em transação para garantir consistência
      return await prisma.$transaction(async (tx) => {
        // Deletar pesagens relacionadas
        await tx.weighIn.deleteMany({
          where: { athleteId: id },
        });

        // Deletar body measurements relacionados
        await tx.bodyMeasurement.deleteMany({
          where: { athleteId: id },
        });

        // Deletar entries relacionados
        await tx.entry.deleteMany({
          where: { athleteId: id },
        });

        // Deletar o atleta
        await tx.athlete.delete({
          where: { id },
        });

        // Deletar o usuário relacionado
        await tx.user.delete({
          where: { id: athlete.userId },
        });

        return true;
      });
    },
  },

  Athlete: {
    user: (parent: any) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
    coach: (parent: any) =>
      parent.coachId
        ? prisma.coach.findUnique({
            where: { id: parent.coachId },
            include: { user: true },
          })
        : null,
  },

  Coach: {
    user: (parent: any) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
    athletes: (parent: any) =>
      prisma.athlete.findMany({
        where: { coachId: parent.id },
        include: { user: true },
      }),
  },

  User: {
    athlete: (parent: any) =>
      prisma.athlete.findUnique({ where: { userId: parent.id } }),
    coach: (parent: any) =>
      prisma.coach.findUnique({ where: { userId: parent.id } }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    if (req.method === "OPTIONS") {
      return { prisma, currentUser: null };
    }
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.warn("Missing Authorization header");
      return { prisma, currentUser: null };
    }
    const currentUser = await verifyFirebaseTokenAndGetUser(authHeader);
    if (!currentUser) {
      console.warn("Invalid/expired Firebase token");
    }
    return { prisma, currentUser };
  },
  cors: {
    origin: true,
    credentials: true,
  },
});

server
  .listen({ port: Number(process.env.PORT) || 4000, path: "/graphql" })
  .then(({ url }) => {
    console.log(`🚀 GraphQL server running at ${url}`);
  });
