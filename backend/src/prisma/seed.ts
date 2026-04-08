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
