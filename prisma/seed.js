import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  { name: "Balayage", category: "Hair", priceMin: 70, priceMax: 90, duration: 90 },
  { name: "Haircut & Style", category: "Hair", priceMin: 25, priceMax: 35, duration: 45 },
  { name: "Highlights", category: "Hair", priceMin: 80, priceMax: 110, duration: 100 },
  { name: "Blowdry", category: "Hair", priceMin: 20, priceMax: 25, duration: 30 },
  { name: "Full Makeup", category: "Makeup", priceMin: 45, priceMax: 60, duration: 45 },
  { name: "Bridal Makeup", category: "Makeup", priceMin: 90, priceMax: 120, duration: 75 },
];

async function main() {
  console.log("Seeding services...");

  // Clear existing services first, so re-running doesn't duplicate
  await prisma.service.deleteMany();

  // Insert all services
  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  console.log("Done! Seeded", services.length, "services.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });