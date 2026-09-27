-- CreateEnum
CREATE TYPE "judotracker"."CompetitionLevel" AS ENUM ('REGIONAL', 'ESTADUAL', 'NACIONAL', 'INTERNACIONAL');

-- AlterTable
ALTER TABLE "judotracker"."Competition" ADD COLUMN     "level" "judotracker"."CompetitionLevel",
ADD COLUMN     "federation" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "registrationDeadline" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT;
