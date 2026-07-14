"use client";

import { useState, useEffect } from "react";

// Plain-language labels — never show raw statuses to her
const STATUS_LABELS = {
  waiting: "Waiting",
  in_progress: "Being served",
  pending_payment: "Needs payment",
};

export default function ReconciliationPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");
  const [closing, setClosing] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/reconciliation/today");
      if (!res.ok) {
        setError("Something went wrong. Please refresh the page or log in again.");
        return;
      }
      setData(await res.json());
      setError(null);
    } catch {
      setError("Something went wrong. Please refresh the page or log in again.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function closeDay() {
    const counted = Number(actualCash);
    if (actualCash === "" || !Number.isInteger(counted) || counted < 0) {
      alert("Please enter the cash you counted as a whole number (for example 250).");
      return;
    }

    if (
      !window.confirm(
        `Close the day with $${counted} counted in cash?\n\nOnce closed, it is locked and cannot be changed.`
      )
    ) {
      return;
    }

    setClosing(true);
    try {
      const res = await fetch("/api/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actualCash: counted, notes }),
      });

      if (res.ok) {
        const reconciliation = await res.json();
        setData((d) => ({ ...d, reconciliation }));
        return;
      }

      // 409 — either already closed, or unresolved clients appeared meanwhile.
      const payload = await res.json().catch(() => ({}));
      if (payload.reconciliation) {
        setData((d) => ({ ...d, reconciliation: payload.reconciliation }));
      } else if (payload.unresolved) {
        setData((d) => ({ ...d, unresolved: payload.unresolved }));
      }
      alert(payload.error || "Could not close the day. Please try again.");
    } catch {
      alert("Could not close the day. Please try again.");
    } finally {
      setClosing(false);
    }
  }

  if (error) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">Loading…</p>
      </section>
    );
  }

  const { reconciliation, expectedCash, tipsTotal, unresolved } = data;

  // ── STATE 1: the day is already closed → locked summary only, no inputs ──
  if (reconciliation) {
    const diff = reconciliation.difference;

    return (
      <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
        <h1 className="text-gold text-5xl font-bold">Day Closed</h1>
        <p className="text-cream text-2xl mt-3">
          {new Date(reconciliation.date).toLocaleDateString([], {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
          {" · 🔒 locked"}
        </p>

        <div className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6 mt-8">
          <div className="flex justify-between items-baseline">
            <span className="text-cream text-2xl">Expected cash</span>
            <span className="text-cream text-3xl font-bold">${reconciliation.expectedCash}</span>
          </div>
          <div className="flex justify-between items-baseline mt-3">
            <span className="text-cream text-2xl">Cash counted</span>
            <span className="text-cream text-3xl font-bold">${reconciliation.actualCash}</span>
          </div>
          <div className="flex justify-between items-baseline mt-3 border-t border-cream/20 pt-5">
            <span className="text-cream text-2xl">Tips</span>
            <span className="text-cream text-3xl font-bold">${reconciliation.tipsTotal}</span>
          </div>
        </div>

        {/* Difference — loud when it is not zero */}
        {diff === 0 ? (
          <div className="mt-6 border-4 border-gold bg-gold/20 rounded-2xl p-6 text-center">
            <p className="text-cream text-3xl font-bold">Perfect match ✓</p>
          </div>
        ) : (
          <div className="mt-6 border-4 border-gold bg-gold text-ink rounded-2xl p-6 text-center">
            <p className="text-2xl font-bold">
              {diff > 0 ? "Extra cash in the drawer" : "Cash is short"}
            </p>
            <p className="text-5xl font-bold mt-2">
              {diff > 0 ? "+" : "−"}${Math.abs(diff)}
            </p>
          </div>
        )}

        {reconciliation.notes && (
          <div className="bg-cream/10 border-2 border-gold/20 rounded-2xl p-6 mt-6">
            <p className="text-cream/80 text-xl">Notes</p>
            <p className="text-cream text-2xl mt-2">{reconciliation.notes}</p>
          </div>
        )}
      </section>
    );
  }

  // ── STATE 2 & 3: not closed yet ──
  const hasUnresolved = unresolved.length > 0;

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      <h1 className="text-gold text-5xl font-bold">Close the Day</h1>
      <p className="text-cream text-2xl mt-3">Count the cash and compare it with the total.</p>

      {/* Expected cash — big */}
      <div className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6 mt-8 text-center">
        <p className="text-cream text-2xl">Expected cash</p>
        <p className="text-gold text-7xl font-bold mt-2">${expectedCash}</p>
        <p className="text-cream/80 text-xl mt-3">Tips today: ${tipsTotal}</p>
      </div>

      {hasUnresolved ? (
        /* ── STATE 2: blocked — unresolved clients must be finished first ── */
        <div className="mt-8">
          <div className="border-4 border-gold bg-gold text-ink rounded-2xl p-6">
            <p className="text-2xl font-bold leading-snug">
              ⚠ You cannot close the day yet — {unresolved.length}{" "}
              {unresolved.length === 1 ? "client is" : "clients are"} still open.
            </p>
            <p className="text-xl mt-3">
              Finish or remove them on the Queue page first, then come back here.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {unresolved.map((u) => (
              <div
                key={u.id}
                className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6 flex justify-between items-center flex-wrap gap-3"
              >
                <span className="text-gold text-3xl font-bold">{u.name}</span>
                <span className="text-cream text-xl border-2 border-cream/30 rounded-full px-4 py-1">
                  {STATUS_LABELS[u.status] || u.status}
                </span>
              </div>
            ))}
          </div>

          <a
            href="/admin/queue"
            className="block w-full bg-gold text-ink text-2xl font-bold py-6 rounded-2xl mt-8 text-center hover:bg-gold-light transition-colors"
          >
            Go to the Queue
          </a>
        </div>
      ) : (
        /* ── STATE 3: ready to close ── */
        <div className="mt-8">
          <label className="text-cream text-2xl font-bold block mb-3">Actual cash counted</label>
          <input
            type="number"
            inputMode="numeric"
            value={actualCash}
            onChange={(e) => setActualCash(e.target.value)}
            placeholder="e.g. 250"
            className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-5 text-cream text-3xl font-bold placeholder:text-cream/40"
          />

          <label className="text-cream text-2xl font-bold block mb-3 mt-8">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything worth remembering"
            className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl placeholder:text-cream/40"
          />

          <button
            onClick={closeDay}
            disabled={closing}
            className={
              closing
                ? "w-full bg-cream/10 text-cream/40 text-2xl font-bold py-6 rounded-2xl mt-10 cursor-not-allowed"
                : "w-full bg-gold text-ink text-2xl font-bold py-6 rounded-2xl mt-10 hover:bg-gold-light transition-colors"
            }
          >
            {closing ? "Closing…" : "🔒  Close the Day"}
          </button>
        </div>
      )}
    </section>
  );
}
