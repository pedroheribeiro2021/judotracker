import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // usuário atleta exemplo
  const user = await prisma.user.create({
    data: {
      email: "joao@example.com",
      name: "João Silva",
      role: "ATHLETE",
    },
  });

  const athlete = await prisma.athlete.create({
    data: {
      userId: user.id,
      dob: new Date("1998-05-10"),
      sex: "M",
      heightCm: 175,
      defaultWeightKg: 73,
    },
  });

  await prisma.weighIn.createMany({
    data: [
      {
        athleteId: athlete.id,
        weightKg: 75,
        recordedAt: new Date("2025-08-01"),
      },
      {
        athleteId: athlete.id,
        weightKg: 74,
        recordedAt: new Date("2025-08-10"),
      },
      {
        athleteId: athlete.id,
        weightKg: 73.2,
        recordedAt: new Date("2025-09-01"),
      },
    ],
  });

  const pastCompetition = await prisma.competition.create({
    data: {
      name: "Copa São Paulo de Judô",
      date: new Date("2025-08-20"),
      location: "Ginásio do Ibirapuera",
      level: "ESTADUAL",
      federation: "FPJ",
      city: "São Paulo",
      state: "SP",
    },
  });

  const upcomingCompetition = await prisma.competition.create({
    data: {
      name: "Campeonato Brasileiro de Judô",
      date: new Date("2026-11-15"),
      location: "Ginásio Ibirapuera",
      level: "NACIONAL",
      federation: "CBJ",
      city: "São Paulo",
      state: "SP",
      registrationDeadline: new Date("2026-10-15"),
    },
  });

  const entry = await prisma.entry.create({
    data: {
      competitionId: pastCompetition.id,
      athleteId: athlete.id,
      weightClass: "-73",
      finalPosition: 3,
      medal: "BRONZE",
    },
  });

  await prisma.entry.create({
    data: {
      competitionId: upcomingCompetition.id,
      athleteId: athlete.id,
      weightClass: "-73",
    },
  });

  await prisma.match.createMany({
    data: [
      {
        entryId: entry.id,
        round: "eliminatória",
        opponentName: "Carlos Mendes",
        opponentClub: "Equipe Alfa",
        result: "WIN",
        scoreType: "IPPON",
        technique: "seoi-nage",
        shidosFor: 0,
        shidosAgainst: 1,
      },
      {
        entryId: entry.id,
        round: "semifinal",
        opponentName: "Bruno Costa",
        opponentClub: "Equipe Beta",
        result: "LOSS",
        scoreType: "WAZA_ARI",
        technique: "o-soto-gari",
        shidosFor: 1,
        shidosAgainst: 0,
      },
      {
        entryId: entry.id,
        round: "disputa de bronze",
        opponentName: "Diego Alves",
        opponentClub: "Equipe Gama",
        result: "WIN",
        scoreType: "DECISION",
        goldenScore: true,
        shidosFor: 1,
        shidosAgainst: 2,
      },
    ],
  });

  await prisma.promotion.createMany({
    data: [
      {
        athleteId: athlete.id,
        rank: "BROWN",
        promotedAt: new Date("2022-03-01"),
        promotedBy: "Sensei Yamamoto",
      },
      {
        athleteId: athlete.id,
        rank: "BLACK_1DAN",
        promotedAt: new Date("2024-08-15"),
        promotedBy: "Sensei Yamamoto",
      },
    ],
  });

  const DAY_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const trainingSessions = await Promise.all(
    [2, 9, 16, 23].map((daysAgo, i) =>
      prisma.trainingSession.create({
        data: {
          date: new Date(now - daysAgo * DAY_MS),
          type: ["RANDORI", "TECHNICAL", "PHYSICAL", "RANDORI"][i] as any,
          durationMinutes: 90,
          notes: i === 0 ? "Foco em newaza" : undefined,
        },
      }),
    ),
  );

  // Presente nas 3 sessões mais recentes, ausente na mais antiga (demonstra
  // taxa de presença e sequência atual no card de frequência do atleta).
  await prisma.attendance.createMany({
    data: trainingSessions.slice(0, 3).map((s) => ({
      sessionId: s.id,
      athleteId: athlete.id,
      present: true,
    })),
  });

  await prisma.injury.create({
    data: {
      athleteId: athlete.id,
      bodyPart: "Joelho direito",
      description: "Entorse leve durante randori",
      occurredAt: new Date(now - 60 * DAY_MS),
      expectedReturn: new Date(now - 40 * DAY_MS),
      resolvedAt: new Date(now - 38 * DAY_MS),
      severity: "MINOR",
      notes: "Liberado pelo fisioterapeuta",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
