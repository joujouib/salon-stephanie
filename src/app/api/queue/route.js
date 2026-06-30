import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// GET /api/queue — returns all waiting + in-progress queue entries
export async function GET() {
  const entries = await prisma.queueEntry.findMany({
    where: {
      status: { in: ["waiting", "in_progress"] },
    },
    include: {
      client: true,
      staff: true,
      visitServices: { include: { service: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return NextResponse.json(entries);
}
// POST /api/queue — add a new entry to the queue
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { clientId, serviceIds, staffId, notes } = body;

  // Validation — now expects an array of service IDs
  if (!clientId || !serviceIds || serviceIds.length === 0) {
    return NextResponse.json(
      { error: "clientId and at least one service are required" },
      { status: 400 }
    );
  }

  const entry = await prisma.queueEntry.create({
    data: {
      clientId,
      staffId: staffId || null,
      notes: notes || null,
      status: "waiting",
      // Create the join rows — one per chosen service
      visitServices: {
        create: serviceIds.map((serviceId) => ({ serviceId })),
      },
    },
    include: {
      client: true,
      staff: true,
      visitServices: { include: { service: true } },
    },
  });

  return NextResponse.json(entry, { status: 201 });
}