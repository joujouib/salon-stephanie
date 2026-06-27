"use client";

import { useState, useEffect } from "react";

export default function AdminQueuePage() {
  const [entries, setEntries] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [newClientName, setNewClientName] = useState("");

  // Load everything the page needs
  async function loadAll() {
    const [queueRes, clientsRes, servicesRes] = await Promise.all([
      fetch("/api/queue"),
      fetch("/api/clients"),
      fetch("/api/services"),
    ]);
    setEntries(await queueRes.json());
    setClients(await clientsRes.json());
    setServices(await servicesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Update a queue entry's status
  async function updateStatus(id, status) {
    await fetch(`/api/queue/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadAll();
  }

  // Add a walk-in to the queue
  async function addToQueue() {

    if (selectedClient && newClientName.trim()) {
    alert("Please either pick an existing client OR type a new name, not both.");
    return;
  }
  
    let clientId = selectedClient;

    // If a new client name was typed, create that client first
    if (newClientName.trim()) {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      const newClient = await res.json();
      clientId = newClient.id;
    }

    if (!clientId || !selectedService) {
      alert("Please choose a client (or type a new name) and a service.");
      return;
    }

    await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, serviceId: selectedService }),
    });

    // Reset the form
    setSelectedClient("");
    setSelectedService("");
    setNewClientName("");
    loadAll();
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

      {/* Add walk-in form */}
      <div className="bg-cream/5 border border-gold/20 rounded-xl p-5 mt-8">
        <h2 className="text-gold text-lg font-semibold mb-4">Add a walk-in</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Existing client dropdown */}
          <div>
            <label className="text-cream/60 text-sm block mb-1">Existing client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full bg-ink border border-cream/20 rounded-lg px-3 py-2 text-cream"
            >
              <option value="">— choose —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* New client name */}
          <div>
            <label className="text-cream/60 text-sm block mb-1">…or new client</label>
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Type a name"
              className="w-full bg-ink border border-cream/20 rounded-lg px-3 py-2 text-cream"
            />
          </div>

          {/* Service dropdown */}
          <div>
            <label className="text-cream/60 text-sm block mb-1">Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-ink border border-cream/20 rounded-lg px-3 py-2 text-cream"
            >
              <option value="">— choose —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.duration} min)</option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              onClick={addToQueue}
              className="w-full bg-gold text-ink px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition-colors"
            >
              Add to Queue
            </button>
          </div>
        </div>
      </div>

      {/* Queue list */}
      <div className="mt-8 space-y-4">
        {entries.length === 0 ? (
          <p className="text-cream/50">The queue is empty.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-cream/5 border border-gold/20 rounded-xl p-5 flex items-center justify-between"
            >
              <div>
                <h3 className="text-gold text-xl font-semibold">{entry.client.name}</h3>
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