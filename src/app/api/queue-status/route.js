import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { estimateWait } from "@/lib/waitTime";

// Public endpoint — returns ONLY the two numbers the public /queue page shows.
// No auth (no client data exposed); no entries returned.
export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await prisma.queueEntry.findMany({
    where: { status: { in: ["waiting", "in_progress"] } },
    include: {
      visitServices: { include: { service: true } },
    },
  });

  const settings = await prisma.salonSettings.findFirst();
  const activeStaff = settings ? settings.activeStaffCount : 3;

  const peopleWaiting = entries.length;
  const estimatedWaitMinutes = estimateWait(entries, activeStaff);

  return NextResponse.json({ peopleWaiting, estimatedWaitMinutes });
}
