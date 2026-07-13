import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { queueEntryId, prices, discountType, discountValue, paymentMethod, tipTotal, notes } = body;

  // --- Validation: never trust the client, especially with money ---
  if (!queueEntryId || !prices || !paymentMethod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["cash", "card", "transfer"].includes(paymentMethod)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  // Fetch the entry with its services — the server builds its own picture
  const entry = await prisma.queueEntry.findUnique({
    where: { id: queueEntryId },
    include: { visitServices: true, transaction: true },
  });

  if (!entry) {
    return NextResponse.json({ error: "Queue entry not found" }, { status: 404 });
  }
  if (entry.status !== "pending_payment") {
    return NextResponse.json({ error: "Entry is not awaiting payment" }, { status: 409 });
  }
  if (entry.transaction) {
    return NextResponse.json({ error: "Already finalized" }, { status: 409 });
  }

  // Every service must have a price, and it must be a sane integer
  for (const vs of entry.visitServices) {
    const p = prices[vs.id];
    if (!Number.isInteger(p) || p < 0 || p > 10000) {
      return NextResponse.json({ error: "Invalid or missing price for a service" }, { status: 400 });
    }
  }

  // --- The server does the math (client sends facts, never totals) ---
  const subtotal = entry.visitServices.reduce((sum, vs) => sum + prices[vs.id], 0);

  let totalAfterDiscount = subtotal;
  if (discountType === "percentage") {
    if (!Number.isInteger(discountValue) || discountValue < 0 || discountValue > 100) {
      return NextResponse.json({ error: "Invalid percentage" }, { status: 400 });
    }
    totalAfterDiscount = Math.round(subtotal * (100 - discountValue) / 100);
  } else if (discountType === "fixed") {
    if (!Number.isInteger(discountValue) || discountValue < 0 || discountValue > subtotal) {
      return NextResponse.json({ error: "Invalid discount amount" }, { status: 400 });
    }
    totalAfterDiscount = subtotal - discountValue;
  } else if (discountType) {
    return NextResponse.json({ error: "Invalid discount type" }, { status: 400 });
  }

  const tip = Number.isInteger(tipTotal) && tipTotal >= 0 ? tipTotal : 0;

  // --- The atomic write: all three changes succeed together or not at all ---
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        queueEntryId,
        clientId: entry.clientId,
        subtotal,
        discountType: discountType || null,
        discountValue: discountType ? discountValue : null,
        totalAfterDiscount,
        paymentMethod,
        tipTotal: tip,
        notes: notes || null,
      },
    }),
    ...entry.visitServices.map((vs) =>
      prisma.visitService.update({
        where: { id: vs.id },
        data: { priceCharged: prices[vs.id] },
      })
    ),
    prisma.queueEntry.update({
      where: { id: queueEntryId },
      data: { status: "done" },
    }),
  ]);

  return NextResponse.json(transaction, { status: 201 });
}