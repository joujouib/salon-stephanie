import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
// PATCH /api/queue/[id] — update one entry's status
export async function PATCH(request, { params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ["waiting", "in_progress", "done", "cancelled", "no_show"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Build the update — set timestamps based on the new status
  const data = { status };
  if (status === "in_progress") data.startedAt = new Date();
  if (status === "done" || status === "cancelled" || status === "no_show") {
    data.finishedAt = new Date();
  }

  const entry = await prisma.queueEntry.update({
    where: { id },
    data,
    include: {
      client: true,
      staff: true,
      visitServices: { include: { service: true } },
    },
  });

  return NextResponse.json(entry);
}