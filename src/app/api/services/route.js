import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/services — list active services
export async function GET() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(services);
}