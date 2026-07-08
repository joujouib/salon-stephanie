"use client";

import { useState, useEffect } from "react";
import { estimateWait } from "@/lib/waitTime";

export default function AdminQueuePage() {
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [activeStaffCount, setActiveStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [clientSearch, setClientSearch] = useState("");
  const [chosenClient, setChosenClient] = useState(null); // {id, name} or null
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [durationMinutes, setDurationMinutes] = useState("");

  async function loadAll() {
    try {
      const [queueRes, clientsRes, servicesRes, settingsRes] = await Promise.all([
        fetch("/api/queue"),
        fetch("/api/clients"),
        fetch("/api/services"),
        fetch("/api/settings"),
      ]);

      if (!queueRes.ok || !clientsRes.ok || !servicesRes.ok || !settingsRes.ok) {
        setError(true);
        return;
      }

      const [queueData, clientsData, servicesData, settingsData] = await Promise.all([
        queueRes.json(),
        clientsRes.json(),
        servicesRes.json(),
        settingsRes.json(),
      ]);

      setEntries(queueData);
      setClients(clientsData);
      setServices(servicesData);
      setActiveStaffCount(settingsData.activeStaffCount);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Keep the duration field in sync with the auto-computed sum whenever services change
  useEffect(() => {
    const autoSum = selectedServiceIds.reduce((sum, id) => {
      const service = services.find((s) => s.id === id);
      return sum + (service ? service.duration : 0);
    }, 0);
    setDurationMinutes(String(autoSum));
  }, [selectedServiceIds, services]);

  async function updateStaffCount(count) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeStaffCount: count }),
    });
    loadAll();
  }

  async function updateStatus(id, status) {
    await fetch(`/api/queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAll();
  }

  function confirmRemove(entry) {
    if (window.confirm(`Remove ${entry.client.name} from the queue?`)) {
      updateStatus(entry.id, "cancelled");
    }
  }

  function toggleService(serviceId) {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  }

  function closeForm() {
    setClientSearch("");
    setChosenClient(null);
    setSelectedServiceIds([]);
    setDurationMinutes("");
    setShowAddForm(false);
  }

  // Normalize a name: trim, lowercase, collapse multiple spaces
  function normalizeName(str) {
    return str.trim().toLowerCase().replace(/\s+/g, " ");
  }

  // Matching clients as she types (case-insensitive), only when no client chosen yet
  const matchingClients =
    clientSearch.trim().length > 0
      ? clients.filter((c) =>
          c.name.toLowerCase().includes(clientSearch.trim().toLowerCase())
        )
      : [];

  // Does an exact-name client already exist? (for the duplicate warning)
  const exactMatch = clients.find(
    (c) => normalizeName(c.name) === normalizeName(clientSearch)
  );

  async function addToQueue() {
    if (selectedServiceIds.length === 0) {
      alert("Please choose at least one service.");
      return;
    }

    let clientId;

    if (chosenClient) {
      // She tapped an existing client
      clientId = chosenClient.id;
    } else if (clientSearch.trim()) {
      // She typed a new name — create the client
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clientSearch.trim() }),
      });
      const newClient = await res.json();
      clientId = newClient.id;
    } else {
      alert("Please choose a client or type a name.");
      return;
    }

    const autoSum = selectedServiceIds.reduce((sum, id) => {
      const service = services.find((s) => s.id === id);
      return sum + (service ? service.duration : 0);
    }, 0);
    const enteredDuration = Number(durationMinutes);
    const body = { clientId, serviceIds: selectedServiceIds };
    if (enteredDuration !== autoSum) {
      body.durationOverride = enteredDuration;
    }

    await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    closeForm();
    loadAll();
  }

  function totalDuration(entry) {
    if (entry.durationOverride) return entry.durationOverride;
    return entry.visitServices.reduce((sum, vs) => sum + vs.service.duration, 0);
  }

  // Group services by category for the picker
  const servicesByCategory = services.reduce((groups, s) => {
    (groups[s.category] = groups[s.category] || []).push(s);
    return groups;
  }, {});

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

  const estimatedWait = estimateWait(entries, activeStaffCount);

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      <h1 className="text-gold text-5xl font-bold">Today's Queue</h1>
      <p className="text-cream text-2xl mt-3">
        {entries.length} {entries.length === 1 ? "person" : "people"} waiting
        {estimatedWait > 0 && ` · about ${estimatedWait} min`}
      </p>

      <div className="flex items-center gap-3 mt-4">
        <label className="text-cream text-xl">Staff working today:</label>
        <select
          value={activeStaffCount}
          onChange={(e) => updateStaffCount(Number(e.target.value))}
          className="bg-ink border-2 border-cream/40 text-cream text-xl rounded-xl px-4 py-2"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setShowAddForm(true)}
        className="w-full bg-gold text-ink text-2xl font-bold py-6 rounded-2xl mt-8 hover:bg-gold-light transition-colors"
      >
        ➕  Add Walk-in
      </button>

      {/* Queue list */}
      <div className="mt-8 space-y-5">
        {entries.length === 0 ? (
          <p className="text-cream/80 text-2xl text-center mt-12">
            No one is waiting right now.
          </p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6">
              <div>
                <h3 className="text-gold text-3xl font-bold">{entry.client.name}</h3>
                <p className="text-cream text-xl mt-2">
                  {entry.visitServices.map((vs) => vs.service.name).join(" + ")}
                </p>
                <p className="text-cream/80 text-lg mt-1">{totalDuration(entry)} minutes</p>
                {entry.status === "in_progress" && (
                  <span className="inline-block mt-3 text-xl text-ink bg-gold rounded-full px-4 py-1 font-bold">
                    Being served
                  </span>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                {entry.status === "waiting" && (
                  <button
                    onClick={() => updateStatus(entry.id, "in_progress")}
                    className="flex-1 bg-gold/20 text-gold border-2 border-gold/50 text-xl font-bold py-4 rounded-xl hover:bg-gold/30 transition-colors"
                  >
                    Start
                  </button>
                )}
                {entry.status === "in_progress" && (
                  <button
                    onClick={() => updateStatus(entry.id, "done")}
                    className="flex-1 bg-gold text-ink text-xl font-bold py-4 rounded-xl hover:bg-gold-light transition-colors"
                  >
                    Finished
                  </button>
                )}
                <button
                  onClick={() => confirmRemove(entry)}
                  className="flex-1 text-cream border-2 border-cream/30 text-xl font-bold py-4 rounded-xl hover:border-cream/60 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add walk-in modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-ink border-2 border-gold/40 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-gold text-3xl font-bold mb-6">Add Walk-in</h2>

            {/* Client search */}
            <label className="text-cream text-xl block mb-2">Client name</label>

            {chosenClient ? (
              // A client is chosen — show it with a "change" option
              <div className="flex items-center justify-between bg-gold/20 border-2 border-gold/50 rounded-xl px-4 py-4 mb-6">
                <span className="text-cream text-xl font-bold">{chosenClient.name}</span>
                <button
                  onClick={() => { setChosenClient(null); setClientSearch(""); }}
                  className="text-gold text-lg underline"
                >
                  change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Type a name to search or add"
                  className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl placeholder:text-cream/40"
                />

                {/* Live matching results */}
                {matchingClients.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {matchingClients.slice(0, 5).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setChosenClient(c)}
                        className="w-full text-left bg-cream/10 border-2 border-cream/20 rounded-xl px-4 py-3 text-cream text-lg hover:border-gold/50 transition-colors"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Duplicate warning / new client hint */}
                {clientSearch.trim() && !exactMatch && (
                  <p className="text-cream/70 text-base mt-3">
                    {matchingClients.length > 0 && clientSearch.trim().length >= 3
                      ? `No exact match — tapping Add will create a new client "${clientSearch.trim()}". If they're listed above, tap their name instead.`
                      : `No exact match — a new client "${clientSearch.trim()}" will be added.`}
                  </p>
                )}
                {exactMatch && (
                  <p className="text-gold text-base mt-3">
                    This client already exists — tap their name above to choose them.
                  </p>
                )}
              </>
            )}

            {/* Services grouped by category */}
            <label className="text-cream text-xl block mb-3 mt-6">Services</label>
            {Object.keys(servicesByCategory).map((category) => (
              <div key={category} className="mb-5">
                <p className="text-cream/70 text-lg mb-2">{category}</p>
                <div className="flex flex-wrap gap-3">
                  {servicesByCategory[category].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleService(s.id)}
                      className={
                        selectedServiceIds.includes(s.id)
                          ? "bg-gold text-ink text-lg font-bold px-5 py-3 rounded-xl"
                          : "bg-cream/10 text-cream text-lg px-5 py-3 rounded-xl border-2 border-cream/30"
                      }
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Total time */}
            <label className="text-cream text-xl block mb-2 mt-6">Total time (minutes)</label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl placeholder:text-cream/40"
            />

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={addToQueue}
                className="flex-1 bg-gold text-ink text-xl font-bold py-4 rounded-xl hover:bg-gold-light transition-colors"
              >
                Add
              </button>
              <button
                onClick={closeForm}
                className="flex-1 text-cream border-2 border-cream/30 text-xl font-bold py-4 rounded-xl hover:border-cream/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}