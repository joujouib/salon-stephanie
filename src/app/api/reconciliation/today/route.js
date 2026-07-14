import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Statuses that mean a client is still "open" — the day cannot close while any exist.
const UNRESOLVED_STATUSES = ["waiting", "in_progress", "pending_payment"];

// GET /api/reconciliation/today
// Returns today's reconciliation record (or null), plus the live numbers the page
// needs to render BEFORE closing: expected cash, tips, and any unresolved entries.
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Today = from local midnight to now (same boundary as /api/transactions/today)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const reconciliation = await prisma.dailyReconciliation.findFirst({
    where: { createdAt: { gte: startOfDay } },
  });

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: startOfDay } },
  });

  // Expected cash = today's CASH transactions only. Tips = all of today's tips.
  let expectedCash = 0;
  let tipsTotal = 0;
  for (const t of transactions) {
    if (t.paymentMethod === "cash") expectedCash += t.totalAfterDiscount;
    tipsTotal += t.tipTotal;
  }

  // Any still-open queue entry blocks closing (includes overnight leftovers).
  const unresolvedEntries = await prisma.queueEntry.findMany({
    where: { status: { in: UNRESOLVED_STATUSES } },
    include: { client: true },
    orderBy: { joinedAt: "asc" },
  });

  const unresolved = unresolvedEntries.map((e) => ({
    id: e.id,
    name: e.client.name,
    status: e.status,
  }));

  return NextResponse.json({ reconciliation, expectedCash, tipsTotal, unresolved });
}
