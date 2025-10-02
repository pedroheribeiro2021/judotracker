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
  }

  type Athlete {
    id: ID!
    userId: ID!
    user: User
    dob: String
    heightCm: Float
    defaultWeightKg: Float
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
  }

  input RecordWeighInInput {
    athleteId: ID!
    weightKg: Float!
    recordedAt: String
    notes: String
  }

  type Query {
    athletes: [Athlete!]!
    athlete(id: ID!): Athlete
    weighIns(athleteId: ID!): [WeighIn!]!
  }

  type Mutation {
    createAthlete(input: CreateAthleteInput!): Athlete!
    recordWeighIn(input: RecordWeighInInput!): WeighIn!
  }
`;

const resolvers = {
  Query: {
    athletes: async (_: any, __: any, ctx: any) => {
      // Exemplo de proteção simples: somente usuários autenticados podem listar atletas
      if (!ctx.currentUser) {
        throw new Error("Unauthorized");
      }
      return prisma.athlete.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });
    },

    athlete: async (_: any, { id }: { id: string }, ctx: any) => {
      if (!ctx.currentUser) throw new Error("Unauthorized");
      return prisma.athlete.findUnique({
        where: { id },
        include: { user: true },
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
  },

  Mutation: {
    createAthlete: async (_: any, { input }: any, ctx: any) => {
      // Only coaches/admins might create athletes in real app, but for now require auth
      if (!ctx.currentUser) throw new Error("Unauthorized");

      // Optionally restrict by role: if ctx.currentUser.role !== 'COACH' && role !== 'ADMIN' throw
      const user = await prisma.user.create({
        data: { email: input.email, name: input.name ?? null, role: "ATHLETE" },
      });
      const athlete = await prisma.athlete.create({
        data: {
          userId: user.id,
          dob: input.dob ? new Date(input.dob) : undefined,
          heightCm: input.heightCm,
          defaultWeightKg: input.defaultWeightKg,
        },
        include: { user: true },
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
  },

  Athlete: {
    user: (parent: any) =>
      prisma.user.findUnique({ where: { id: parent.userId } }),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // Extrai header Authorization
    const authHeader = req.headers.authorization;
    const currentUser = await verifyFirebaseTokenAndGetUser(authHeader);
    return { prisma, currentUser };
  },
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 GraphQL server running at ${url}`);
});
