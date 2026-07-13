import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Today = from local midnight to now
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: startOfDay } },
    include: {
      client: true,
      queueEntry: {
        include: { visitServices: { include: { service: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Server-side totals — one authoritative computation
  const totals = { revenue: 0, tips: 0, cash: 0, card: 0, transfer: 0, count: transactions.length };
  for (const t of transactions) {
    totals.revenue += t.totalAfterDiscount;
    totals.tips += t.tipTotal;
    totals[t.paymentMethod] += t.totalAfterDiscount;
  }

  return NextResponse.json({ transactions, totals });
}