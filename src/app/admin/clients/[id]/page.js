"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const THICKNESS = ["Fine", "Medium", "Thick"];
const POROSITY = ["Low", "Medium", "High"];
const LANGUAGES = [
  { value: "ar", label: "Arabic" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
];
const DEVELOPERS = ["10 vol", "20 vol", "30 vol", "40 vol"];
const RATIOS = ["1:1", "1:1.5", "1:2"];
const RATINGS = [
  { value: "perfect", label: "Perfect" },
  { value: "go_darker", label: "Go darker" },
  { value: "go_lighter", label: "Go lighter" },
];

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function languageLabel(v) {
  return LANGUAGES.find((l) => l.value === v)?.label || v;
}
function ratingLabel(v) {
  return RATINGS.find((r) => r.value === v)?.label || v;
}

// Shared chip classes (mom-friendly)
const chipOn = "bg-gold text-ink text-xl font-bold px-5 py-4 rounded-xl";
const chipOff = "bg-cream/10 text-cream text-xl px-5 py-4 rounded-xl border-2 border-cream/30";
const inputClass =
  "w-full bg-cream/10 border-2 border-cream/30 rounded-xl px-4 py-4 text-cream text-xl placeholder:text-cream/40";

export default function ClientProfilePage() {
  const params = useParams();
  const id = params.id;

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal visibility
  const [showBasic, setShowBasic] = useState(false);
  const [showHair, setShowHair] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  // Basic-info form
  const [bName, setBName] = useState("");
  const [bPhone, setBPhone] = useState("");
  const [bLanguage, setBLanguage] = useState("ar");

  // Hair-profile form
  const [hairLevel, setHairLevel] = useState(null);
  const [hairThickness, setHairThickness] = useState(null);
  const [hairPorosity, setHairPorosity] = useState(null);
  const [hairTreatments, setHairTreatments] = useState("");
  const [hairAllergies, setHairAllergies] = useState("");
  const [hairNotes, setHairNotes] = useState("");

  // Formula form
  const [fColorCode, setFColorCode] = useState("");
  const [fBrand, setFBrand] = useState("");
  const [fDeveloper, setFDeveloper] = useState(null);
  const [fRatio, setFRatio] = useState(null);
  const [fMins, setFMins] = useState("");
  const [fRating, setFRating] = useState(null);
  const [fNotes, setFNotes] = useState("");

  async function load() {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      setClient(await res.json());
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function openBasicEdit() {
    setBName(client.name);
    setBPhone(client.phone ?? "");
    setBLanguage(client.language);
    setShowBasic(true);
  }

  function openHairEdit() {
    const hp = client.hairProfile;
    setHairLevel(hp?.naturalLevel ?? null);
    setHairThickness(hp?.thickness ?? null);
    setHairPorosity(hp?.porosity ?? null);
    setHairTreatments(hp?.treatments ?? "");
    setHairAllergies(hp?.allergies ?? "");
    setHairNotes(hp?.notes ?? "");
    setShowHair(true);
  }

  function openAddFormula() {
    setFColorCode("");
    setFBrand("");
    setFDeveloper(null);
    setFRatio(null);
    setFMins("");
    setFRating(null);
    setFNotes("");
    setShowFormula(true);
  }

  async function saveBasic() {
    if (!bName.trim()) {
      alert("Please enter a name.");
      return;
    }

    function submit(force) {
      return fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bName.trim(),
          phone: bPhone.trim(),
          language: bLanguage,
          force,
        }),
      });
    }

    let res = await submit(false);

    // Duplicate name → warn, but let her save anyway (no hard block)
    if (res.status === 409) {
      const e = await res.json().catch(() => ({}));
      if (e.duplicate) {
        if (!window.confirm("Another client already has this name. Save anyway?")) return;
        res = await submit(true);
      }
    }

    if (res.ok) {
      setShowBasic(false);
      load();
    } else {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Could not save. Please try again.");
    }
  }

  async function saveHair() {
    const res = await fetch(`/api/clients/${id}/hair-profile`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        naturalLevel: hairLevel,
        thickness: hairThickness,
        porosity: hairPorosity,
        treatments: hairTreatments,
        allergies: hairAllergies,
        notes: hairNotes,
      }),
    });
    if (res.ok) {
      setShowHair(false);
      load();
    } else {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Could not save. Please try again.");
    }
  }

  async function saveFormula() {
    const res = await fetch(`/api/clients/${id}/formulas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        colorCode: fColorCode,
        brand: fBrand,
        developerVol: fDeveloper,
        mixRatio: fRatio,
        processingMins: fMins,
        rating: fRating,
        notes: fNotes,
      }),
    });
    if (res.ok) {
      setShowFormula(false);
      load();
    } else {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Could not save. Please try again.");
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">Loading…</p>
      </section>
    );
  }

  if (error || !client) {
    return (
      <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
        <p className="text-cream text-2xl">
          Something went wrong. Please refresh the page or log in again.
        </p>
        <Link href="/admin/clients" className="text-gold text-xl underline mt-4 inline-block">
          ← Back to clients
        </Link>
      </section>
    );
  }

  const hp = client.hairProfile;

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      <Link href="/admin/clients" className="text-gold text-xl underline">
        ← All clients
      </Link>

      <h1 className="text-gold text-5xl font-bold mt-4">{client.name}</h1>

      {/* a) BASIC INFO */}
      <div className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6 mt-6">
        <h2 className="text-gold text-3xl font-bold mb-4">Basic Info</h2>
        <InfoRow label="Phone" value={client.phone || "Not set"} />
        <InfoRow label="Language" value={languageLabel(client.language)} />
        <button
          onClick={openBasicEdit}
          className="w-full bg-gold/20 text-gold border-2 border-gold/50 text-xl font-bold py-4 rounded-xl mt-5 hover:bg-gold/30 transition-colors"
        >
          Edit
        </button>
      </div>

      {/* b) HAIR PROFILE */}
      <div className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6 mt-6">
        <h2 className="text-gold text-3xl font-bold mb-4">Hair Profile</h2>
        <InfoRow label="Natural level" value={hp?.naturalLevel != null ? hp.naturalLevel : "Not set"} />
        <InfoRow label="Thickness" value={hp?.thickness || "Not set"} />
        <InfoRow label="Porosity" value={hp?.porosity || "Not set"} />
        <InfoRow label="Treatments" value={hp?.treatments || "Not set"} />
        <InfoRow label="Allergies" value={hp?.allergies || "Not set"} />
        <InfoRow label="Notes" value={hp?.notes || "Not set"} />
        <button
          onClick={openHairEdit}
          className="w-full bg-gold/20 text-gold border-2 border-gold/50 text-xl font-bold py-4 rounded-xl mt-5 hover:bg-gold/30 transition-colors"
        >
          Edit Hair Profile
        </button>
      </div>

      {/* d) Calculator shortcut */}
      <Link
        href={hp?.naturalLevel != null ? `/admin/color-tool?level=${hp.naturalLevel}` : "/admin/color-tool"}
        className="block text-center w-full text-cream border-2 border-cream/30 text-xl font-bold py-4 rounded-xl mt-6 hover:border-cream/60 transition-colors"
      >
        Open Formula Calculator
      </Link>

      {/* c) FORMULA HISTORY */}
      <div className="mt-10">
        <h2 className="text-gold text-3xl font-bold">Formula History</h2>
        <button
          onClick={openAddFormula}
          className="w-full bg-gold text-ink text-2xl font-bold py-6 rounded-2xl mt-5 hover:bg-gold-light transition-colors"
        >
          ➕  Add Formula
        </button>

        <div className="mt-6 space-y-5">
          {client.formulas.length === 0 ? (
            <p className="text-cream/80 text-2xl text-center mt-8">No formulas recorded yet.</p>
          ) : (
            client.formulas.map((f) => (
              <div key={f.id} className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6">
                <p className="text-cream/70 text-lg">{formatDate(f.performedAt)}</p>
                {f.colorCode && <p className="text-gold text-4xl font-bold mt-1">{f.colorCode}</p>}
                <div className="mt-3 space-y-1">
                  {f.brand && <p className="text-cream text-xl">Brand: {f.brand}</p>}
                  {f.developerVol && <p className="text-cream text-xl">Developer: {f.developerVol}</p>}
                  {f.mixRatio && <p className="text-cream text-xl">Mix ratio: {f.mixRatio}</p>}
                  {f.processingMins != null && (
                    <p className="text-cream text-xl">Time: {f.processingMins} min</p>
                  )}
                  {f.rating && <p className="text-cream text-xl">Result: {ratingLabel(f.rating)}</p>}
                  {f.notes && <p className="text-cream text-xl">Notes: {f.notes}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ---- Basic info modal ---- */}
      {showBasic && (
        <Modal title="Edit Basic Info" onClose={() => setShowBasic(false)} onSave={saveBasic}>
          <label className="text-cream text-xl block mb-2">Name</label>
          <input
            type="text"
            value={bName}
            onChange={(e) => setBName(e.target.value)}
            className={`${inputClass} mb-6`}
          />

          <label className="text-cream text-xl block mb-2">Phone</label>
          <input
            type="text"
            value={bPhone}
            onChange={(e) => setBPhone(e.target.value)}
            placeholder="Optional"
            className={`${inputClass} mb-6`}
          />

          <label className="text-cream text-xl block mb-2">Language</label>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((l) => (
              <button
                key={l.value}
                onClick={() => setBLanguage(l.value)}
                className={bLanguage === l.value ? chipOn : chipOff}
              >
                {l.label}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* ---- Hair profile modal ---- */}
      {showHair && (
        <Modal title="Edit Hair Profile" onClose={() => setShowHair(false)} onSave={saveHair}>
          <label className="text-cream text-xl block mb-3">Natural level</label>
          <div className="flex flex-wrap gap-3 mb-6">
            {LEVELS.map((n) => (
              <button
                key={n}
                onClick={() => setHairLevel(hairLevel === n ? null : n)}
                className={
                  hairLevel === n
                    ? "bg-gold text-ink text-2xl font-bold w-16 h-16 rounded-xl"
                    : "bg-cream/10 text-cream text-2xl w-16 h-16 rounded-xl border-2 border-cream/30"
                }
              >
                {n}
              </button>
            ))}
          </div>

          <label className="text-cream text-xl block mb-3">Thickness</label>
          <div className="flex flex-wrap gap-3 mb-6">
            {THICKNESS.map((t) => (
              <button
                key={t}
                onClick={() => setHairThickness(hairThickness === t ? null : t)}
                className={hairThickness === t ? chipOn : chipOff}
              >
                {t}
              </button>
            ))}
          </div>

          <label className="text-cream text-xl block mb-3">Porosity</label>
          <div className="flex flex-wrap gap-3 mb-6">
            {POROSITY.map((p) => (
              <button
                key={p}
                onClick={() => setHairPorosity(hairPorosity === p ? null : p)}
                className={hairPorosity === p ? chipOn : chipOff}
              >
                {p}
              </button>
            ))}
          </div>

          <label className="text-cream text-xl block mb-2">Treatments</label>
          <input
            type="text"
            value={hairTreatments}
            onChange={(e) => setHairTreatments(e.target.value)}
            placeholder="e.g. keratin, henna"
            className={`${inputClass} mb-6`}
          />

          <label className="text-cream text-xl block mb-2">Allergies</label>
          <input
            type="text"
            value={hairAllergies}
            onChange={(e) => setHairAllergies(e.target.value)}
            placeholder="e.g. PPD"
            className={`${inputClass} mb-6`}
          />

          <label className="text-cream text-xl block mb-2">Notes</label>
          <input
            type="text"
            value={hairNotes}
            onChange={(e) => setHairNotes(e.target.value)}
            placeholder="Anything else to remember"
            className={inputClass}
          />
        </Modal>
      )}

      {/* ---- Add formula modal ---- */}
      {showFormula && (
        <Modal title="Add Formula" onClose={() => setShowFormula(false)} onSave={saveFormula}>
          <label className="text-cream text-xl block mb-2">Color code</label>
          <input
            type="text"
            value={fColorCode}
            onChange={(e) => setFColorCode(e.target.value)}
            placeholder="e.g. 7.3"
            className={`${inputClass} mb-6`}
          />

          <label className="text-cream text-xl block mb-2">Brand</label>
          <input
            type="text"
            value={fBrand}
            onChange={(e) => setFBrand(e.target.value)}
            placeholder="Optional"
            className={`${inputClass} mb-6`}
          />

          <label className="text-cream text-xl block mb-3">Developer</label>
          <div className="flex flex-wrap gap-3 mb-6">
            {DEVELOPERS.map((d) => (
              <button
                key={d}
                onClick={() => setFDeveloper(fDeveloper === d ? null : d)}
                className={fDeveloper === d ? chipOn : chipOff}
              >
                {d}
              </button>
            ))}
          </div>

          <label className="text-cream text-xl block mb-3">Mix ratio</label>
          <div className="flex flex-wrap gap-3 mb-6">
            {RATIOS.map((r) => (
              <button
                key={r}
                onClick={() => setFRatio(fRatio === r ? null : r)}
                className={fRatio === r ? chipOn : chipOff}
              >
                {r}
              </button>
            ))}
          </div>

          <label className="text-cream text-xl block mb-2">Processing time (minutes)</label>
          <input
            type="number"
            value={fMins}
            onChange={(e) => setFMins(e.target.value)}
            placeholder="e.g. 35"
            className={`${inputClass} mb-6`}
          />

          <label className="text-cream text-xl block mb-3">Result</label>
          <div className="flex flex-wrap gap-3 mb-6">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => setFRating(fRating === r.value ? null : r.value)}
                className={fRating === r.value ? chipOn : chipOff}
              >
                {r.label}
              </button>
            ))}
          </div>

          <label className="text-cream text-xl block mb-2">Notes</label>
          <input
            type="text"
            value={fNotes}
            onChange={(e) => setFNotes(e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </Modal>
      )}
    </section>
  );
}

// One label/value line
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline gap-4 border-b border-cream/10 py-2">
      <span className="text-cream/80 text-xl">{label}</span>
      <span className="text-cream text-2xl font-bold text-right">{value}</span>
    </div>
  );
}

// Shared modal shell (same pattern as the services editor)
function Modal({ title, children, onClose, onSave }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-ink border-2 border-gold/40 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-gold text-3xl font-bold mb-6">{title}</h2>
        {children}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onSave}
            className="flex-1 bg-gold text-ink text-xl font-bold py-4 rounded-xl hover:bg-gold-light transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 text-cream border-2 border-cream/30 text-xl font-bold py-4 rounded-xl hover:border-cream/60 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
