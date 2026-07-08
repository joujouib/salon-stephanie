import { displayFont } from "../fonts";
import { prisma } from "@/lib/prisma";
import { estimateWait } from "@/lib/waitTime";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const entries = await prisma.queueEntry.findMany({
    where: { status: { in: ["waiting", "in_progress"] } },
    include: {
      visitServices: { include: { service: true } },
    },
  });

  const peopleWaiting = entries.length;
  const settings = await prisma.salonSettings.findFirst();
  const activeStaff = settings ? settings.activeStaffCount : 3;

  const estimatedWait = estimateWait(entries, activeStaff);

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <h1 className={`${displayFont.className} text-gold text-5xl font-bold`}>
        Salon Status
      </h1>

      <div className="w-24 h-px bg-gold my-8"></div>

      {peopleWaiting === 0 ? (
        <p className="text-cream/80 text-xl">No wait right now — come on in! ✨</p>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-gold text-7xl font-bold">{peopleWaiting}</p>
            <p className="text-cream/70 mt-2">
              {peopleWaiting === 1 ? "person" : "people"} currently at the salon
            </p>
          </div>
          <div>
            <p className="text-cream/80 text-2xl">
              {estimatedWait === 0 ? "No wait!" : `~${estimatedWait} min`}
            </p>
            <p className="text-cream/50 text-sm mt-1">estimated wait</p>
          </div>
        </div>
      )}
    </section>
  );
}