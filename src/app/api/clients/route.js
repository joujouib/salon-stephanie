import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// GET /api/clients — list all clients
export async function GET() {

     const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } 

  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { formulas: true } } },
  });
  return NextResponse.json(clients);
}

// POST /api/clients — create a new client
export async function POST(request) {

     const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const body = await request.json();
  const { name, phone, language } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      name,
      phone: phone || null,
      language: language || "ar",
    },
  });

  return NextResponse.json(client, { status: 201 });
}