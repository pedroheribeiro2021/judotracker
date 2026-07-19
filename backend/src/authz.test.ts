import { describe, expect, it } from "vitest";
import { ApolloServer, gql } from "apollo-server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createMockContext, athleteUser } from "./testUtils/mockContext";

// Sobe um Apollo Server real (schema + resolvers de produção) por teste,
// trocando apenas o contextValue para injetar Prisma mockado e o usuário logado.
function buildTestServer(currentUser: Parameters<typeof createMockContext>[0]) {
  const mock = createMockContext(currentUser);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async () => mock,
  });
  return { server, mock };
}

const CREATE_ATHLETE = gql`
  mutation CreateAthlete($input: CreateAthleteInput!) {
    createAthlete(input: $input) {
      id
    }
  }
`;

describe("autorização de ponta a ponta (schema + resolvers reais)", () => {
  it("mutation protegida falha com FORBIDDEN quando o usuário não é COACH/ADMIN", async () => {
    const { server, mock } = buildTestServer(athleteUser);

    const res = await server.executeOperation({
      query: CREATE_ATHLETE,
      variables: { input: { email: "novo@mail.com" } },
    });

    expect(res.errors).toBeDefined();
    expect(res.errors?.[0].extensions?.code).toBe("FORBIDDEN");
    expect(mock.prisma.user.create).not.toHaveBeenCalled();
  });

  it("mutation protegida funciona para role COACH", async () => {
    const { server, mock } = buildTestServer({
      uid: "u1",
      role: "COACH",
      id: "coach-user-1",
    });
    mock.prisma.user.create.mockResolvedValue({ id: "user-1" } as any);
    mock.prisma.athlete.create.mockResolvedValue({ id: "athlete-1" } as any);

    const res = await server.executeOperation({
      query: CREATE_ATHLETE,
      variables: { input: { email: "novo@mail.com" } },
    });

    expect(res.errors).toBeUndefined();
    expect(res.data?.createAthlete).toEqual({ id: "athlete-1" });
  });
});
