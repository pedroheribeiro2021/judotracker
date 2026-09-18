-- CreateEnum
CREATE TYPE "public"."CompetitionLevel" AS ENUM ('REGIONAL', 'ESTADUAL', 'NACIONAL', 'INTERNACIONAL');

-- AlterTable
ALTER TABLE "public"."Competition" ADD COLUMN     "level" "public"."CompetitionLevel",
ADD COLUMN     "federation" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT;
