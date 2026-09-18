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
