import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Statuses that mean a client is still "open" — the day cannot close while any exist.
const UNRESOLVED_STATUSES = ["waiting", "in_progress", "pending_payment"];

// POST /api/reconciliation — close the day.
// Body: { actualCash, notes? }
export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { actualCash, notes } = body;

  // Money is always an integer.
  if (!Number.isInteger(actualCash) || actualCash < 0) {
    return NextResponse.json(
      { error: "actualCash must be a whole number of dollars (0 or more)." },
      { status: 400 }
    );
  }

  // Today = from local midnight to now (same boundary as /api/transactions/today)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 1) The day can only be closed once.
  const existing = await prisma.dailyReconciliation.findFirst({
    where: { createdAt: { gte: startOfDay } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "The day is already closed.", reconciliation: existing },
      { status: 409 }
    );
  }

  // 2) The day cannot close while clients are still unresolved.
  const unresolvedEntries = await prisma.queueEntry.findMany({
    where: { status: { in: UNRESOLVED_STATUSES } },
    include: { client: true },
    orderBy: { joinedAt: "asc" },
  });
  if (unresolvedEntries.length > 0) {
    return NextResponse.json(
      {
        error: "Some clients are still unresolved. Please finish them in the Queue first.",
        unresolved: unresolvedEntries.map((e) => ({
          id: e.id,
          name: e.client.name,
          status: e.status,
        })),
      },
      { status: 409 }
    );
  }

  // 3) Compute the authoritative totals server-side, then lock the record.
  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: startOfDay } },
  });

  let expectedCash = 0;
  let tipsTotal = 0;
  for (const t of transactions) {
    if (t.paymentMethod === "cash") expectedCash += t.totalAfterDiscount;
    tipsTotal += t.tipTotal;
  }

  const reconciliation = await prisma.dailyReconciliation.create({
    data: {
      date: startOfDay,
      expectedCash,
      actualCash,
      difference: actualCash - expectedCash,
      tipsTotal,
      notes: notes?.trim() ? notes.trim() : null,
      isLocked: true,
    },
  });

  return NextResponse.json(reconciliation, { status: 201 });
}
