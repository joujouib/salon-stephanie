import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/queue — returns all waiting + in-progress queue entries
export async function GET() {
  const entries = await prisma.queueEntry.findMany({
    where: {
      status: { in: ["waiting", "in_progress"] },
    },
    include: {
      client: true,
      service: true,
      staff: true,
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(entries);
}
// POST /api/queue — add a new entry to the queue
export async function POST(request) {
  const body = await request.json();

  const { clientId, serviceId, staffId, notes } = body;

  // Basic validation — these are required
  if (!clientId || !serviceId) {
    return NextResponse.json(
      { error: "clientId and serviceId are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.queueEntry.create({
    data: {
      clientId,
      serviceId,
      staffId: staffId || null,
      notes: notes || null,
      status: "waiting",
    },
    include: {
      client: true,
      service: true,
      staff: true,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
