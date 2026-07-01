import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// GET — public list of active services (used by public site + walk-in form)
export async function GET() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(services);
}

// POST — create a new service (admin only)
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, category, priceMin, priceMax, duration } = body;

  if (!name || !category || priceMin == null || priceMax == null || duration == null) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: {
      name,
      category,
      priceMin: Number(priceMin),
      priceMax: Number(priceMax),
      duration: Number(duration),
    },
  });

  return NextResponse.json(service, { status: 201 });
}