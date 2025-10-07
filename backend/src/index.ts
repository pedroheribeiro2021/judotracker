// backend/src/index.ts
import "dotenv/config";
import { ApolloServer, gql } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { verifyFirebaseTokenAndGetUser } from "./auth/index";

const prisma = new PrismaClient();

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
    coachId: ID # ← Adicione esta linha se quiser atribuir um coach ao criar atleta
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
  }

  type Mutation {
    createAthlete(input: CreateAthleteInput!): Athlete!
    recordWeighIn(input: RecordWeighInInput!): WeighIn!
    createCoach(input: CreateCoachInput!): Coach!
    updateAthlete(input: UpdateAthleteInput!): Athlete!
  }
`;

const resolvers = {
  Query: {
    athletes: async (_: any, __: any, ctx: any) => {
      if (!ctx.currentUser) {
        throw new Error("Unauthorized");
      }
      return prisma.athlete.findMany({
        include: {
          user: true,
          coach: { include: { user: true } }, // ← Inclua o coach com user
        },
        orderBy: { createdAt: "desc" },
      });
    },

    athlete: async (_: any, { id }: { id: string }, ctx: any) => {
      if (!ctx.currentUser) throw new Error("Unauthorized");
      return prisma.athlete.findUnique({
        where: { id },
        include: {
          user: true,
          coach: { include: { user: true } }, // ← Inclua o coach com user
        },
      });
    },

    weighIns: async (
      _: any,
      { athleteId }: { athleteId: string },
      ctx: any
    ) => {
      if (!ctx.currentUser) throw new Error("Unauthorized");
      const rows = await prisma.weighIn.findMany({
        where: { athleteId },
        orderBy: { recordedAt: "desc" },
      });
      return rows.map((r) => ({
        ...r,
        recordedAt: r.recordedAt.toISOString(),
      }));
    },

    coaches: async (_: any, __: any, ctx: any) => {
      // if (!ctx.currentUser) throw new Error("Unauthorized");
      return prisma.coach.findMany({
        include: {
          user: true,
          athletes: { include: { user: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    },
  },

  Mutation: {
    createAthlete: async (_: any, { input }: any, ctx: any) => {
      if (!ctx.currentUser) throw new Error("Unauthorized");

      const user = await prisma.user.create({
        data: { email: input.email, name: input.name ?? null, role: "ATHLETE" },
      });

      const athlete = await prisma.athlete.create({
        data: {
          userId: user.id,
          dob: input.dob ? new Date(input.dob) : undefined,
          heightCm: input.heightCm,
          defaultWeightKg: input.defaultWeightKg,
          coachId: input.coachId || null, // ← Atribua o coach se fornecido
        },
        include: {
          user: true,
          coach: { include: { user: true } }, // ← Inclua o coach na resposta
        },
      });
      return athlete;
    },

    recordWeighIn: async (_: any, { input }: any, ctx: any) => {
      if (!ctx.currentUser) throw new Error("Unauthorized");
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

    createCoach: async (_: any, { input }: any, ctx: any) => {
      // if (!ctx.currentUser) throw new Error("Unauthorized");

      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name ?? null,
          role: "COACH", // ← Importante: role como COACH
        },
      });

      const coach = await prisma.coach.create({
        data: {
          userId: user.id,
        },
        include: {
          user: true,
          athletes: { include: { user: true } },
        },
      });
      return coach;
    },

    updateAthlete: async (_: any, { input }: any, ctx: any) => {
      // if (!ctx.currentUser) throw new Error("Unauthorized"); // Comente temporariamente

      const athlete = await prisma.athlete.update({
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

      return athlete;
    },
  },

  // ← Adicione estres resolvers para as relações
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
    const authHeader = req.headers.authorization;
    const currentUser = await verifyFirebaseTokenAndGetUser(authHeader);
    return { prisma, currentUser };
  },
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 GraphQL server running at ${url}`);
});
