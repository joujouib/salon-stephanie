"use client";

import { useState, useEffect } from "react";

export default function AdminQueuePage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the current queue from the API
  async function loadQueue() {
    const res = await fetch("/api/queue");
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }

  // Load once when the page opens
  useEffect(() => {
    loadQueue();
  }, []);

  // Change an entry's status (start / done / cancel)
  async function updateStatus(id, status) {
    await fetch(`/api/queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadQueue(); // refresh the list after updating
  }

  if (loading) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-4xl mx-auto">
        <p className="text-cream/60">Loading queue...</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 pt-28 pb-16 max-w-4xl mx-auto">
      <h1 className="text-gold text-4xl font-bold">Queue Manager</h1>
      <p className="text-cream/60 mt-2">{entries.length} in the queue</p>

      <div className="mt-8 space-y-4">
        {entries.length === 0 ? (
          <p className="text-cream/50">The queue is empty.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-cream/5 border border-gold/20 rounded-xl p-5 flex items-center justify-between"
            >
              {/* Left: client + service info */}
              <div>
                <h3 className="text-gold text-xl font-semibold">
                  {entry.client.name}
                </h3>
                <p className="text-cream/70 text-sm">
                  {entry.service.name} · {entry.service.duration} min
                </p>
                <span
                  className={
                    entry.status === "in_progress"
                      ? "text-xs text-ink bg-gold rounded-full px-2 py-0.5 mt-2 inline-block"
                      : "text-xs text-cream/60 border border-cream/20 rounded-full px-2 py-0.5 mt-2 inline-block"
                  }
                >
                  {entry.status === "in_progress" ? "in progress" : "waiting"}
                </span>
              </div>

              {/* Right: action buttons */}
              <div className="flex gap-2">
                {entry.status === "waiting" && (
                  <button
                    onClick={() => updateStatus(entry.id, "in_progress")}
                    className="bg-gold/20 text-gold border border-gold/40 px-4 py-2 rounded-lg text-sm hover:bg-gold/30 transition-colors"
                  >
                    Start
                  </button>
                )}
                {entry.status === "in_progress" && (
                  <button
                    onClick={() => updateStatus(entry.id, "done")}
                    className="bg-gold text-ink px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-light transition-colors"
                  >
                    Done
                  </button>
                )}
                <button
                  onClick={() => updateStatus(entry.id, "cancelled")}
                  className="text-cream/50 border border-cream/20 px-4 py-2 rounded-lg text-sm hover:border-cream/40 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}