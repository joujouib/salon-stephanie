"use client";

import { useState, useEffect } from "react";

const CATEGORIES = ["Blonde", "Brown", "Red", "Black"];

export default function AdminColorsPage() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#C9A84C");
  const [category, setCategory] = useState("Blonde");
  const [tone, setTone] = useState("either");        // warm / cool / either
  const [lightening, setLightening] = useState("no"); // no / little / yes

  async function loadColors() {
    const res = await fetch("/api/colors/all");
    setColors(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadColors();
  }, []);

  function openAdd() {
    setEditingId(null);
    setName("");
    setHex("#C9A84C");
    setCategory("Blonde");
    setTone("either");
    setLightening("no");
    setShowForm(true);
  }

  function openEdit(color) {
    setEditingId(color.id);
    setName(color.name);
    setHex(color.hex);
    setCategory(color.category);
    // map stored values back to the friendly options
    setTone(color.undertone === "warm" ? "warm" : color.undertone === "cool" ? "cool" : "either");
    setLightening(
      color.lighteningLevel === "heavy" ? "yes" : color.lighteningLevel === "mild" ? "little" : "no"
    );
    setShowForm(true);
  }

  async function save() {
    if (!name.trim()) {
      alert("Please enter a color name.");
      return;
    }

    // Map her friendly answers to the stored fields
    const undertone = tone === "either" ? "neutral" : tone;
    const lighteningLevel =
      lightening === "yes" ? "heavy" : lightening === "little" ? "mild" : "none";
    // Derive suitableFor from lightening
    const suitableFor =
      lighteningLevel === "heavy" ? "light" : lighteningLevel === "mild" ? "light,medium" : "light,medium,dark";

    const payload = { name: name.trim(), hex, category, undertone, lighteningLevel, suitableFor };

    if (editingId) {
      await fetch(`/api/colors/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowForm(false);
    loadColors();
  }

  async function toggleActive(color) {
    const action = color.isActive ? "Hide" : "Show";
    if (!window.confirm(`${action} “${color.name}”?`)) return;
    await fetch(`/api/colors/${color.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !color.isActive }),
    });
    loadColors();
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
      <h1 className="text-gold text-5xl font-bold">My Colors</h1>
      <p className="text-cream text-2xl mt-3">Add, edit, or hide the colors you offer.</p>

      <button
        onClick={openAdd}
        className="w-full bg-gold text-ink text-2xl font-bold py-6 rounded-2xl mt-8 hover:bg-gold-light transition-colors"
      >
        ➕  Add a Color
      </button>

      {/* Colors list */}
      <div className="mt-8 space-y-5">
        {colors.map((color) => (
          <div
            key={color.id}
            className={
              color.isActive
                ? "bg-cream/10 border-2 border-gold/30 rounded-2xl p-6"
                : "bg-cream/5 border-2 border-cream/10 rounded-2xl p-6 opacity-60"
            }
          >
            <div className="flex items-center gap-5">
              {/* Swatch */}
              <div
                className="w-20 h-20 rounded-2xl border-2 border-cream/20 flex-shrink-0"
                style={{ backgroundColor: color.hex }}
              ></div>
              <div>
                <h3 className="text-gold text-3xl font-bold">{color.name}</h3>
                <p className="text-cream text-xl mt-1">{color.category}</p>
                {!color.isActive && (
                  <span className="inline-block mt-2 text-lg text-cream/70 border border-cream/30 rounded-full px-4 py-1">
                    Hidden
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => openEdit(color)}
                className="flex-1 bg-gold/20 text-gold border-2 border-gold/50 text-xl font-bold py-4 rounded-xl hover:bg-gold/30 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => toggleActive(color)}
                className="flex-1 text-cream border-2 border-cream/30 text-xl font-bold py-4 rounded-xl hover:border-cream/60 transition-colors"
              >
                {color.isActive ? "Hide" : "Show"}
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
              {editingId ? "Edit Color" : "Add a Color"}
            </h2>

            {/* Name */}
            <label className="text-cream text-xl block mb-2">Color name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Honey Blonde"
              className="w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl mb-6 placeholder:text-cream/40"
            />

            {/* Color picker */}
            <label className="text-cream text-xl block mb-2">Pick the color</label>
            <div className="flex items-center gap-4 mb-6">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-20 h-20 rounded-xl border-2 border-cream/30 bg-transparent cursor-pointer"
              />
              <span className="text-cream text-xl">{hex}</span>
            </div>

            {/* Category */}
            <label className="text-cream text-xl block mb-2">Category</label>
            <div className="flex flex-wrap gap-3 mb-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={
                    category === cat
                      ? "bg-gold text-ink text-lg font-bold px-5 py-3 rounded-xl"
                      : "bg-cream/10 text-cream text-lg px-5 py-3 rounded-xl border-2 border-cream/30"
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Warm or cool */}
            <label className="text-cream text-xl block mb-2">Is it a warm or cool shade?</label>
            <div className="flex gap-3 mb-6">
              {[
                { v: "warm", l: "Warm" },
                { v: "cool", l: "Cool" },
                { v: "either", l: "Either" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setTone(opt.v)}
                  className={
                    tone === opt.v
                      ? "flex-1 bg-gold text-ink text-lg font-bold py-4 rounded-xl"
                      : "flex-1 bg-cream/10 text-cream text-lg py-4 rounded-xl border-2 border-cream/30"
                  }
                >
                  {opt.l}
                </button>
              ))}
            </div>

            {/* Lightening */}
            <label className="text-cream text-xl block mb-2">Does it usually need lightening?</label>
            <div className="flex gap-3 mb-8">
              {[
                { v: "no", l: "No" },
                { v: "little", l: "A little" },
                { v: "yes", l: "Yes" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setLightening(opt.v)}
                  className={
                    lightening === opt.v
                      ? "flex-1 bg-gold text-ink text-lg font-bold py-4 rounded-xl"
                      : "flex-1 bg-cream/10 text-cream text-lg py-4 rounded-xl border-2 border-cream/30"
                  }
                >
                  {opt.l}
                </button>
              ))}
            </div>

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