// backend/src/app.ts
// App Express + Apollo compartilhada entre o servidor local (index.ts) e a
// função serverless da Vercel (api/graphql.ts).
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createContext } from "./context";

let appPromise: Promise<express.Express> | null = null;

async function buildApp() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
    cache: "bounded",
  });
  await server.start();

  const app = express();
  const graphql = server.getMiddleware({
    path: "/",
    cors: { origin: true, credentials: true },
  });
  // Na Vercel a função vive em /api/graphql (com rewrite de /graphql);
  // localmente o endpoint continua sendo /graphql.
  app.use(["/graphql", "/api/graphql"], graphql);
  return app;
}

// Memoizado: em serverless a mesma instância é reaproveitada entre
// invocações "quentes", evitando refazer server.start() a cada request.
export function getApp() {
  if (!appPromise) appPromise = buildApp();
  return appPromise;
}
