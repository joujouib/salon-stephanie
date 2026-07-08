// Calculate the estimated wait (in minutes) for a new arrival.
// entries: all queue entries with status waiting/in_progress, each including visitServices->service
// activeStaffCount: how many staff are working today
export function estimateWait(entries, activeStaffCount) {
  const now = Date.now();

  // Helper: total service minutes for one entry
  const entryDuration = (entry) =>
    entry.durationOverride && entry.durationOverride > 0
      ? entry.durationOverride
      : entry.visitServices.reduce((sum, vs) => sum + vs.service.duration, 0);

  // Step 1: figure out when each active chair becomes free (in minutes from now).
  // Start every chair as free now (0).
  const chairs = new Array(activeStaffCount).fill(0);

  // People currently in progress occupy chairs — push those chairs' free-time out
  // by their REMAINING time.
  const inProgress = entries.filter((e) => e.status === "in_progress");

  inProgress.forEach((entry, index) => {
    if (index >= activeStaffCount) return; // safety: more in-progress than chairs
    const totalMins = entryDuration(entry);
    const startedAt = entry.startedAt ? new Date(entry.startedAt).getTime() : now;
    const elapsedMins = (now - startedAt) / 60000; // ms → minutes
    const remaining = Math.max(0, totalMins - elapsedMins);
    chairs[index] = remaining;
  });

  // Step 2: seat the waiting people, each into the soonest-free chair.
  const waiting = entries.filter((e) => e.status === "waiting");

  for (const entry of waiting) {
    // find the chair that frees up soonest
    let soonest = 0;
    for (let i = 1; i < chairs.length; i++) {
      if (chairs[i] < chairs[soonest]) soonest = i;
    }
    // a NEW arrival would wait for whatever the soonest chair is at, BEFORE this person takes it
    // but since this waiting person is ahead of our newcomer, they take the chair:
    chairs[soonest] += entryDuration(entry);
  }

  // Step 3: the newcomer waits for the soonest-free chair now.
  const wait = Math.min(...chairs);
  return Math.max(0, Math.round(wait));
}