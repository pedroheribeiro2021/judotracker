-- CreateEnum
CREATE TYPE "judotracker"."InjurySeverity" AS ENUM ('MINOR', 'MODERATE', 'SEVERE');

-- CreateTable
CREATE TABLE "judotracker"."Injury" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "expectedReturn" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "severity" "judotracker"."InjurySeverity" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Injury_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "judotracker"."Injury" ADD CONSTRAINT "Injury_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "judotracker"."Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
