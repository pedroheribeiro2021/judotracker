-- CreateEnum
CREATE TYPE "public"."Medal" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'NONE');

-- CreateEnum
CREATE TYPE "public"."MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateEnum
CREATE TYPE "public"."ScoreType" AS ENUM ('IPPON', 'WAZA_ARI', 'WAZA_ARI_AWASETE_IPPON', 'DECISION', 'HANSOKU_MAKE', 'FUSEN_GACHI');

-- AlterTable
ALTER TABLE "public"."Entry" ADD COLUMN     "finalPosition" INTEGER,
ADD COLUMN     "medal" "public"."Medal";

-- CreateTable
CREATE TABLE "public"."Match" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "opponentName" TEXT NOT NULL,
    "opponentClub" TEXT,
    "result" "public"."MatchResult" NOT NULL,
    "scoreType" "public"."ScoreType",
    "technique" TEXT,
    "shidosFor" INTEGER NOT NULL DEFAULT 0,
    "shidosAgainst" INTEGER NOT NULL DEFAULT 0,
    "goldenScore" BOOLEAN NOT NULL DEFAULT false,
    "durationSeconds" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
