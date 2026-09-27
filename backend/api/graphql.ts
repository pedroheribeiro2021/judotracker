// backend/api/graphql.ts
// Função serverless da Vercel: delega para a mesma app Express do dev local.
import type { IncomingMessage, ServerResponse } from "http";
import { getApp } from "../src/app";

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp();
  return app(req as any, res as any);
}
