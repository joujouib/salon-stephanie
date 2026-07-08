"use client";

import { useState, useEffect } from "react";
import { displayFont } from "@/app/fonts";

export default function QueueStatus({ initialPeopleWaiting, initialEstimatedWait }) {
  const [peopleWaiting, setPeopleWaiting] = useState(initialPeopleWaiting);
  const [estimatedWait, setEstimatedWait] = useState(initialEstimatedWait);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/queue-status");
        if (!res.ok) return; // keep last good values
        const data = await res.json();
        if (cancelled) return;
        setPeopleWaiting(data.peopleWaiting);
        setEstimatedWait(data.estimatedWaitMinutes);
      } catch {
        // network error — keep showing the last good values, no error UI
      }
    }

    // Poll every 30s, but only while the tab is actually visible.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchStatus();
    }, 30000);

    // When the tab becomes visible again, refresh immediately.
    function handleVisibility() {
      if (document.visibilityState === "visible") fetchStatus();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

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
