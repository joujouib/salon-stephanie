"use client";

import { useState, useEffect } from "react";

const CATEGORIES = ["Hair", "Makeup"];

export default function AdminServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new, otherwise editing

  // Form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hair");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [duration, setDuration] = useState("");

  async function loadServices() {
    const res = await fetch("/api/services/all");
    setServices(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadServices();
  }, []);

  function openAdd() {
    setEditingId(null);
    setName("");
    setCategory("Hair");
    setPriceMin("");
    setPriceMax("");
    setDuration("");
    setShowForm(true);
  }

  function openEdit(service) {
    setEditingId(service.id);
    setName(service.name);
    setCategory(service.category);
    setPriceMin(String(service.priceMin));
    setPriceMax(String(service.priceMax));
    setDuration(String(service.duration));
    setShowForm(true);
  }

  async function save() {
    if (!name.trim() || !priceMin || !priceMax || !duration) {
      alert("Please fill in all the fields.");
      return;
    }

    const payload = { name: name.trim(), category, priceMin, priceMax, duration };

    if (editingId) {
      // Editing existing
      await fetch(`/api/services/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Adding new
      await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowForm(false);
    loadServices();
  }

  async function toggleActive(service) {
    const action = service.isActive ? "hide" : "show";
    if (!window.confirm(`${action === "hide" ? "Hide" : "Show"} “${service.name}”?`)) return;

    await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !service.isActive }),
    });
    loadServices();
  }

  if (loading) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">Loading…</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      <h1 className="text-gold text-5xl font-bold">My Services</h1>
      <p className="text-cream text-2xl mt-3">Add, edit, or hide the services you offer.</p>

      <button
        onClick={openAdd}
        className="w-full bg-gold text-ink text-2xl font-bold py-6 rounded-2xl mt-8 hover:bg-gold-light transition-colors"
      >
        ➕  Add a Service
      </button>

      {/* Services list */}
      <div className="mt-8 space-y-5">
        {services.map((service) => (
          <div
            key={service.id}
            className={
              service.isActive
                ? "bg-cream/10 border-2 border-gold/30 rounded-2xl p-6"
                : "bg-cream/5 border-2 border-cream/10 rounded-2xl p-6 opacity-60"
            }
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-gold text-3xl font-bold">{service.name}</h3>
                <p className="text-cream text-xl mt-2">
                  {service.category} · ${service.priceMin}–{service.priceMax} · {service.duration} min
                </p>
                {!service.isActive && (
                  <span className="inline-block mt-3 text-lg text-cream/70 border border-cream/30 rounded-full px-4 py-1">
                    Hidden
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => openEdit(service)}
                className="flex-1 bg-gold/20 text-gold border-2 border-gold/50 text-xl font-bold py-4 rounded-xl hover:bg-gold/30 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(service)}
                className="flex-1 text-cream border-2 border-cream/30 text-xl font-bold py-4 rounded-xl hover:border-cream/60 transition-colors"
              >
                {service.isActive ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-ink border-2 border-gold/40 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-gold text-3xl font-bold mb-6">
              {editingId ? "Edit Service" : "Add a Service"}
            </h2>

            {/* Name */}
            <label className="text-cream text-xl block mb-2">Service name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Balayage"
              className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl mb-6 placeholder:text-cream/40"
            />

            {/* Category */}
            <label className="text-cream text-xl block mb-2">Category</label>
            <div className="flex gap-3 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={
                    category === cat
                      ? "flex-1 bg-gold text-ink text-xl font-bold py-4 rounded-xl"
                      : "flex-1 bg-cream/10 text-cream text-xl py-4 rounded-xl border-2 border-cream/30"
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Prices */}
            <label className="text-cream text-xl block mb-2">Price range ($)</label>
            <div className="flex gap-3 mb-6 items-center">
              <input
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="From"
                className="flex-1 bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl placeholder:text-cream/40"
              />
              <span className="text-cream text-xl">to</span>
              <input
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="To"
                className="flex-1 bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl placeholder:text-cream/40"
              />
            </div>

            {/* Duration */}
            <label className="text-cream text-xl block mb-2">How long it takes (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 90"
              className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl mb-8 placeholder:text-cream/40"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={save}
                className="flex-1 bg-gold text-ink text-xl font-bold py-4 rounded-xl hover:bg-gold-light transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
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