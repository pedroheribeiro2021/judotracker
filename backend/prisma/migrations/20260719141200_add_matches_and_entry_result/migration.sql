-- CreateEnum
CREATE TYPE "judotracker"."Medal" AS ENUM ('GOLD', 'SILVER', 'BRONZE', 'NONE');

-- CreateEnum
CREATE TYPE "judotracker"."MatchResult" AS ENUM ('WIN', 'LOSS', 'DRAW');

-- CreateEnum
CREATE TYPE "judotracker"."ScoreType" AS ENUM ('IPPON', 'WAZA_ARI', 'WAZA_ARI_AWASETE_IPPON', 'DECISION', 'HANSOKU_MAKE', 'FUSEN_GACHI');

-- AlterTable
ALTER TABLE "judotracker"."Entry" ADD COLUMN     "finalPosition" INTEGER,
ADD COLUMN     "medal" "judotracker"."Medal";

-- CreateTable
CREATE TABLE "judotracker"."Match" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "opponentName" TEXT NOT NULL,
    "opponentClub" TEXT,
    "result" "judotracker"."MatchResult" NOT NULL,
    "scoreType" "judotracker"."ScoreType",
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
ALTER TABLE "judotracker"."Match" ADD CONSTRAINT "Match_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "judotracker"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
