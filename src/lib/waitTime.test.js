import { estimateWait } from "./waitTime";

// A tiny helper so tests stay readable: build a fake queue entry
function entry({ status, minutes, startedAt = null, durationOverride = null }) {
  return {
    status,
    startedAt,
    durationOverride,
    visitServices: [{ service: { duration: minutes } }],
  };
}

describe("estimateWait", () => {
  test("returns 0 when no one is in the queue", () => {
    expect(estimateWait([], 3)).toBe(0);
  });

  test("returns 0 when there are more chairs than people (the bug George found)", () => {
    const entries = [entry({ status: "waiting", minutes: 90 })];
    expect(estimateWait(entries, 3)).toBe(0);
  });

  test("a newcomer waits for the soonest chair when all chairs are busy", () => {
    const entries = [
      entry({ status: "waiting", minutes: 90 }),
      entry({ status: "waiting", minutes: 30 }),
      entry({ status: "waiting", minutes: 60 }),
    ];
    // 3 people, 3 chairs: all seated immediately; newcomer waits for the shortest (30)
    expect(estimateWait(entries, 3)).toBe(30);
  });

  test("ignores pending_payment entries (they do not occupy a chair)", () => {
    const entries = [entry({ status: "pending_payment", minutes: 90 })];
    expect(estimateWait(entries, 1)).toBe(0);
  });

  test("uses durationOverride when set, instead of summing services", () => {
    const entries = [
      entry({ status: "waiting", minutes: 90, durationOverride: 20 }),
      entry({ status: "waiting", minutes: 90 }),
    ];
    // 1 chair: 20 + 90 = 110 total work before a newcomer sits
    expect(estimateWait(entries, 1)).toBe(110);
  });

  test("counts only REMAINING time for someone already in the chair", () => {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const entries = [
      entry({ status: "in_progress", minutes: 90, startedAt: thirtyMinutesAgo }),
    ];
    // 90 total, 30 elapsed → 60 remaining (allow 1 min of clock drift)
    expect(estimateWait(entries, 1)).toBeCloseTo(60, -0.5);
  });
});