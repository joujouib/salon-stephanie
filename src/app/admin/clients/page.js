"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Normalize a name: trim, lowercase, collapse multiple spaces (same as the queue search)
function normalizeName(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  async function loadClients() {
    try {
      const res = await fetch("/api/clients");
      if (!res.ok) {
        setError(true);
        return;
      }
      setClients(await res.json());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  const matching =
    search.trim().length > 0
      ? clients.filter((c) => normalizeName(c.name).includes(normalizeName(search)))
      : clients;

  if (loading) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">Loading…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">
          Something went wrong. Please refresh the page or log in again.
        </p>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      <h1 className="text-gold text-5xl font-bold">Clients</h1>
      <p className="text-cream text-2xl mt-3">Search a client to see their profile.</p>

      {/* Search box */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type a name to search"
        className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl mt-8 placeholder:text-cream/40"
      />

      {/* Client list */}
      <div className="mt-8 space-y-5">
        {matching.length === 0 ? (
          <p className="text-cream/80 text-2xl text-center mt-12">
            {search.trim() ? "No clients match that name." : "No clients yet."}
          </p>
        ) : (
          matching.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clients/${c.id}`}
              className="block bg-cream/10 border-2 border-gold/30 rounded-2xl p-6 hover:border-gold/60 transition-colors"
            >
              <h3 className="text-gold text-3xl font-bold">{c.name}</h3>
              {c.phone && <p className="text-cream text-xl mt-2">{c.phone}</p>}
              <p className="text-cream/70 text-lg mt-1">
                {c._count?.formulas || 0}{" "}
                {c._count?.formulas === 1 ? "formula" : "formulas"} on record
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
