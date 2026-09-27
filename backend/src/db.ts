// backend/src/db.ts
// Instância única do Prisma Client. Em serverless cada instância da função
// deve abrir uma só conexão com o pooler (connection_limit=1 na DATABASE_URL).
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
