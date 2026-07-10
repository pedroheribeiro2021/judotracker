// backend/src/index.ts
import "dotenv/config";
import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createContext } from "./context";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
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
