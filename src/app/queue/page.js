import { displayFont } from "../fonts";
import { prisma } from "@/lib/prisma";

export default async function QueuePage() {
  // Fetch waiting + in-progress entries directly
  const entries = await prisma.queueEntry.findMany({
    where: { status: { in: ["waiting", "in_progress"] } },
    include: { service: true },
  });

  // How many people are currently in the queue
  const peopleWaiting = entries.length;

  // Count active staff (to estimate wait)
  const activeStaff = await prisma.staff.count({ where: { isActive: true } });

  // Simple estimate: total service time / active staff
  const totalMinutes = entries.reduce((sum, e) => sum + e.service.duration, 0);
  const estimatedWait =
    activeStaff > 0 ? Math.ceil(totalMinutes / activeStaff) : totalMinutes;

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
            <p className="text-cream/80 text-2xl">~{estimatedWait} min</p>
            <p className="text-cream/50 text-sm mt-1">estimated wait</p>
          </div>
        </div>
      )}
    </section>
  );
}