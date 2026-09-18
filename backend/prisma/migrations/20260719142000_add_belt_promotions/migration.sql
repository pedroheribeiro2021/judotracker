-- CreateEnum
CREATE TYPE "public"."BeltRank" AS ENUM ('WHITE', 'WHITE_GREY', 'GREY', 'GREY_BLUE', 'BLUE', 'BLUE_YELLOW', 'YELLOW', 'YELLOW_ORANGE', 'ORANGE', 'GREEN', 'PURPLE', 'BROWN', 'BLACK_1DAN', 'BLACK_2DAN', 'BLACK_3DAN', 'BLACK_4DAN', 'BLACK_5DAN', 'RED_WHITE_6DAN', 'RED_WHITE_7DAN', 'RED_WHITE_8DAN', 'RED_9DAN', 'RED_10DAN');

-- CreateTable
CREATE TABLE "public"."Promotion" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "rank" "public"."BeltRank" NOT NULL,
    "promotedAt" TIMESTAMP(3) NOT NULL,
    "promotedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Promotion" ADD CONSTRAINT "Promotion_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "public"."Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
