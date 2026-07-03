import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET — public list of active colors
export async function GET() {
  const colors = await prisma.color.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  });
  return NextResponse.json(colors);
}

// POST — create a new color (admin only)
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, hex, category, undertone, lighteningLevel, suitableFor } = body;

  if (!name || !hex || !category) {
    return NextResponse.json({ error: "Name, color, and category are required" }, { status: 400 });
  }

  const color = await prisma.color.create({
    data: {
      name,
      hex,
      category,
      undertone: undertone || "neutral",
      lighteningLevel: lighteningLevel || "none",
      suitableFor: suitableFor || "light,medium,dark",
    },
  });

  return NextResponse.json(color, { status: 201 });
}