"use client";

import { useState, useEffect } from "react";

export default function TodayPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/transactions/today");
      if (!res.ok) {
        setError("Something went wrong. Please refresh the page or log in again.");
        return;
      }
      setData(await res.json());
    }
    load();
  }, []);

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

  const { transactions, totals } = data;

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      <h1 className="text-gold text-5xl font-bold">Today</h1>
      <p className="text-cream text-2xl mt-3">
        {totals.count} {totals.count === 1 ? "payment" : "payments"} so far
      </p>

      {/* Totals card */}
      <div className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6 mt-8">
        <div className="flex justify-between items-baseline">
          <span className="text-cream text-2xl">Revenue</span>
          <span className="text-gold text-4xl font-bold">${totals.revenue}</span>
        </div>
        <div className="flex justify-between items-baseline mt-3">
          <span className="text-cream text-2xl">Tips</span>
          <span className="text-cream text-3xl font-bold">${totals.tips}</span>
        </div>
        <div className="border-t border-cream/20 mt-5 pt-5 space-y-2">
          <div className="flex justify-between text-cream/80 text-xl">
            <span>💵 Cash</span><span>${totals.cash}</span>
          </div>
          <div className="flex justify-between text-cream/80 text-xl">
            <span>💳 Card</span><span>${totals.card}</span>
          </div>
          <div className="flex justify-between text-cream/80 text-xl">
            <span>📱 Transfer</span><span>${totals.transfer}</span>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="mt-8 space-y-4">
        {transactions.length === 0 ? (
          <p className="text-cream/80 text-2xl text-center mt-12">No payments yet today.</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="bg-cream/10 border-2 border-gold/20 rounded-2xl p-5">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="text-gold text-2xl font-bold">{t.client.name}</h3>
                  <p className="text-cream text-lg mt-1">
                    {t.queueEntry.visitServices.map((vs) => vs.service.name).join(" + ")}
                  </p>
                  <p className="text-cream/60 text-base mt-1">
                    {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" · "}
                    {t.paymentMethod === "cash" ? "💵 Cash" : t.paymentMethod === "card" ? "💳 Card" : "📱 Transfer"}
                    {t.discountType && " · discount applied"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gold text-3xl font-bold">${t.totalAfterDiscount}</p>
                  {t.tipTotal > 0 && (
                    <p className="text-cream/70 text-lg">+${t.tipTotal} tip</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}