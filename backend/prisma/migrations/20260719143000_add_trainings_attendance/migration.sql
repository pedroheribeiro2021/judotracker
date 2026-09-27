-- CreateEnum
CREATE TYPE "judotracker"."TrainingType" AS ENUM ('TECHNICAL', 'RANDORI', 'PHYSICAL', 'KATA', 'COMPETITION_PREP');

-- CreateTable
CREATE TABLE "judotracker"."TrainingSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "judotracker"."TrainingType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "coachId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judotracker"."Attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "present" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_sessionId_athleteId_key" ON "judotracker"."Attendance"("sessionId", "athleteId");

-- AddForeignKey
ALTER TABLE "judotracker"."TrainingSession" ADD CONSTRAINT "TrainingSession_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "judotracker"."Coach"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judotracker"."Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "judotracker"."TrainingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judotracker"."Attendance" ADD CONSTRAINT "Attendance_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "judotracker"."Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
