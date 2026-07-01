"use client";

import { useState, useEffect } from "react";
import { estimateWait } from "@/lib/waitTime";

export default function AdminQueuePage() {
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [activeStaffCount, setActiveStaffCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Is the "add walk-in" popup open?
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);

  async function loadAll() {
    const [queueRes, clientsRes, servicesRes, staffRes] = await Promise.all([
      fetch("/api/queue"),
      fetch("/api/clients"),
      fetch("/api/services"),
      fetch("/api/staff"),
    ]);
    setEntries(await queueRes.json());
    setClients(await clientsRes.json());
    setServices(await servicesRes.json());
    setActiveStaffCount((await staffRes.json()).length);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function updateStatus(id, status) {
    await fetch(`/api/queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAll();
  }

  // Remove with a confirmation, so nobody is removed by accident
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
    setSelectedClient("");
    setNewClientName("");
    setSelectedServiceIds([]);
    setShowAddForm(false);
  }

  async function addToQueue() {
    if (selectedClient && newClientName.trim()) {
      alert("Please either pick an existing client OR type a new name, not both.");
      return;
    }

    let clientId = selectedClient;

    if (newClientName.trim()) {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      const newClient = await res.json();
      clientId = newClient.id;
    }

    if (!clientId || selectedServiceIds.length === 0) {
      alert("Please choose a client (or type a name) and at least one service.");
      return;
    }

    await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, serviceIds: selectedServiceIds }),
    });

    closeForm();
    loadAll();
  }

  function totalDuration(entry) {
    return entry.visitServices.reduce((sum, vs) => sum + vs.service.duration, 0);
  }

  if (loading) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">Loading…</p>
      </section>
    );
  }

  const estimatedWait = estimateWait(entries, activeStaffCount);

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <h1 className="text-gold text-5xl font-bold">Today's Queue</h1>
      <p className="text-cream text-2xl mt-3">
        {entries.length} {entries.length === 1 ? "person" : "people"} waiting
        {estimatedWait > 0 && ` · about ${estimatedWait} min`}
      </p>

      {/* Big add button */}
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
            <div
              key={entry.id}
              className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
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
              </div>

              {/* Big action buttons */}
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

      {/* Add walk-in popup (modal) */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-ink border-2 border-gold/40 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-gold text-3xl font-bold mb-6">Add Walk-in</h2>

            {/* Existing client */}
            <label className="text-cream text-xl block mb-2">Choose a client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl mb-5"
            >
              <option value="">— choose —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* New client */}
            <label className="text-cream text-xl block mb-2">…or type a new name</label>
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="New client name"
              className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl mb-6 placeholder:text-cream/40"
            />

            {/* Services */}
            <label className="text-cream text-xl block mb-3">Services</label>
            <div className="flex flex-wrap gap-3 mb-8">
              {services.map((s) => (
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

            {/* Actions */}
            <div className="flex gap-3">
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