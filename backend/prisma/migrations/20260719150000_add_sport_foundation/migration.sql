-- CreateTable
CREATE TABLE "public"."Sport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sport_slug_key" ON "public"."Sport"("slug");

-- Seed: judô é a única modalidade suportada por ora. Id fixo para que o
-- DEFAULT das colunas sportId abaixo aponte sempre para este registro (ver
-- backend/src/domain/sports/registry.ts, JUDO_SPORT_ID).
INSERT INTO "public"."Sport" ("id", "name", "slug")
VALUES ('a0000000-0000-4000-8000-000000000001', 'Judô', 'judo');

-- AlterTable
ALTER TABLE "public"."Team" ADD COLUMN "sportId" TEXT NOT NULL DEFAULT 'a0000000-0000-4000-8000-000000000001';

-- AlterTable
ALTER TABLE "public"."Competition" ADD COLUMN "sportId" TEXT NOT NULL DEFAULT 'a0000000-0000-4000-8000-000000000001';

-- AlterTable
ALTER TABLE "public"."TrainingSession" ADD COLUMN "sportId" TEXT NOT NULL DEFAULT 'a0000000-0000-4000-8000-000000000001';

-- AddForeignKey
ALTER TABLE "public"."Team" ADD CONSTRAINT "Team_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "public"."Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Competition" ADD CONSTRAINT "Competition_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "public"."Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainingSession" ADD CONSTRAINT "TrainingSession_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "public"."Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
