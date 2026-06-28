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

const staff = [
  { name: "Stephanie", role: "owner", isActive: true },
  { name: "Helper One", role: "helper", isActive: true },
  { name: "Helper Two", role: "helper", isActive: true },
];

const colors = [
  { name: "Honey Blonde",    hex: "#D4A857", category: "Blonde", undertone: "warm",    lighteningLevel: "mild",  suitableFor: "light,medium" },
  { name: "Platinum Blonde", hex: "#EDE6D6", category: "Blonde", undertone: "cool",    lighteningLevel: "heavy", suitableFor: "light" },
  { name: "Ash Brown",       hex: "#6B5B4F", category: "Brown",  undertone: "cool",    lighteningLevel: "none",  suitableFor: "light,medium,dark" },
  { name: "Chocolate Brown", hex: "#3B2719", category: "Brown",  undertone: "warm",    lighteningLevel: "none",  suitableFor: "light,medium,dark" },
  { name: "Copper",          hex: "#B45309", category: "Red",    undertone: "warm",    lighteningLevel: "mild",  suitableFor: "light,medium" },
  { name: "Burgundy",        hex: "#5C1A2B", category: "Red",    undertone: "cool",    lighteningLevel: "mild",  suitableFor: "light,medium,dark" },
  { name: "Jet Black",       hex: "#0D0D0D", category: "Black",  undertone: "neutral", lighteningLevel: "none",  suitableFor: "light,medium,dark" },
];

async function main() {
  console.log("Seeding...");

  // Clear children first (they reference parents)
  await prisma.queueEntry.deleteMany();

  // Services
  await prisma.service.deleteMany();
  for (const service of services) {
    await prisma.service.create({ data: service });
  }
  console.log("Seeded", services.length, "services.");

  // Staff
  await prisma.staff.deleteMany();
  for (const member of staff) {
    await prisma.staff.create({ data: member });
  }
  console.log("Seeded", staff.length, "staff.");

  // Colors
  await prisma.color.deleteMany();
  for (const color of colors) {
    await prisma.color.create({ data: color });
  }
  console.log("Seeded", colors.length, "colors.");

  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });