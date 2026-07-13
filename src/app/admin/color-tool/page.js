"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { calculateFormula, TONES } from "@/lib/colorFormula";

const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const STATUS_OPTIONS = [
  { value: "virgin", label: "Natural (never colored)" },
  { value: "previously-colored", label: "Has color in it" },
];

const CONDITION_OPTIONS = [
  { value: "healthy", label: "Healthy" },
  { value: "dry", label: "Dry" },
  { value: "damaged", label: "Damaged" },
  { value: "very-damaged", label: "Very damaged" },
];

// Capitalize a tone value for display
function toneLabel(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

// Friendly description of the lift number
function liftLabel(n) {
  if (n > 0) return `${n} ${n === 1 ? "level" : "levels"} lighter`;
  if (n === 0) return "Same level (deposit)";
  return `${Math.abs(n)} ${Math.abs(n) === 1 ? "level" : "levels"} darker (deposit)`;
}

function ColorToolForm() {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [targetLevel, setTargetLevel] = useState(null);
  const [hairStatus, setHairStatus] = useState(null);
  const [hairCondition, setHairCondition] = useState(null);
  const [desiredTone, setDesiredTone] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  // Pre-select "Hair now" when arriving from a client profile with ?level=N (1–10)
  const searchParams = useSearchParams();
  useEffect(() => {
    const lvl = parseInt(searchParams.get("level"), 10);
    if (Number.isInteger(lvl) && lvl >= 1 && lvl <= 10) {
      setCurrentLevel(lvl);
    }
  }, [searchParams]);

  const allChosen =
    currentLevel !== null &&
    targetLevel !== null &&
    hairStatus !== null &&
    hairCondition !== null &&
    desiredTone !== null;

  function getFormula() {
    try {
      const r = calculateFormula({
        currentLevel,
        targetLevel,
        hairStatus,
        hairCondition,
        desiredTone,
      });
      setResult(r);
      setError(null);
      setExplanation(null);
    } catch (e) {
      setError(e.message);
      setResult(null);
    }
  }

  async function explainFormula() {
    setExplaining(true);
    setExplanation(null);
    try {
      const res = await fetch("/api/explain-formula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputs: { currentLevel, targetLevel, hairStatus, hairCondition, desiredTone },
          result,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setExplanation(data.explanation);
    } catch {
      setExplanation("Could not get an explanation right now — the formula above is still correct.");
    } finally {
      setExplaining(false);
    }
  }

  function startOver() {
    setCurrentLevel(null);
    setTargetLevel(null);
    setHairStatus(null);
    setHairCondition(null);
    setDesiredTone(null);
    setResult(null);
    setError(null);
    setExplanation(null);
    setExplaining(false);
  }

  // Shared chip classes (mom-friendly: large text, big touch targets)
  const chipOn = "bg-gold text-ink text-xl font-bold px-5 py-4 rounded-xl";
  const chipOff = "bg-cream/10 text-cream text-xl px-5 py-4 rounded-xl border-2 border-cream/30";

  return (
    <section className="min-h-screen px-6 pt-28 pb-24 max-w-3xl mx-auto">
      <h1 className="text-gold text-5xl font-bold">Formula Calculator</h1>
      <p className="text-cream text-2xl mt-3">
        Enter the hair situation and get a professional starting formula.
      </p>

      {/* Hair now */}
      <label className="text-cream text-2xl font-bold block mt-10 mb-3">Hair now</label>
      <div className="flex flex-wrap gap-3">
        {LEVELS.map((n) => (
          <button
            key={n}
            onClick={() => setCurrentLevel(n)}
            className={
              currentLevel === n
                ? "bg-gold text-ink text-2xl font-bold w-16 h-16 rounded-xl"
                : "bg-cream/10 text-cream text-2xl w-16 h-16 rounded-xl border-2 border-cream/30"
            }
          >
            {n}
          </button>
        ))}
      </div>

      {/* Goal */}
      <label className="text-cream text-2xl font-bold block mt-8 mb-3">Goal</label>
      <div className="flex flex-wrap gap-3">
        {LEVELS.map((n) => (
          <button
            key={n}
            onClick={() => setTargetLevel(n)}
            className={
              targetLevel === n
                ? "bg-gold text-ink text-2xl font-bold w-16 h-16 rounded-xl"
                : "bg-cream/10 text-cream text-2xl w-16 h-16 rounded-xl border-2 border-cream/30"
            }
          >
            {n}
          </button>
        ))}
      </div>

      {/* Hair status */}
      <label className="text-cream text-2xl font-bold block mt-8 mb-3">Hair status</label>
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setHairStatus(o.value)}
            className={hairStatus === o.value ? chipOn : chipOff}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Hair condition */}
      <label className="text-cream text-2xl font-bold block mt-8 mb-3">Hair condition</label>
      <div className="flex flex-wrap gap-3">
        {CONDITION_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => setHairCondition(o.value)}
            className={hairCondition === o.value ? chipOn : chipOff}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Desired tone */}
      <label className="text-cream text-2xl font-bold block mt-8 mb-3">Desired tone</label>
      <div className="flex flex-wrap gap-3">
        {TONES.map((t) => (
          <button
            key={t}
            onClick={() => setDesiredTone(t)}
            className={desiredTone === t ? chipOn : chipOff}
          >
            {toneLabel(t)}
          </button>
        ))}
      </div>

      {/* Get Formula */}
      <button
        onClick={getFormula}
        disabled={!allChosen}
        className={
          allChosen
            ? "w-full bg-gold text-ink text-2xl font-bold py-6 rounded-2xl mt-10 hover:bg-gold-light transition-colors"
            : "w-full bg-cream/10 text-cream/40 text-2xl font-bold py-6 rounded-2xl mt-10 cursor-not-allowed"
        }
      >
        Get Formula
      </button>

      {error && (
        <div className="mt-8 border-4 border-gold bg-gold/15 rounded-2xl p-6">
          <p className="text-cream text-2xl font-bold">⚠ {error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-10">
          <div className="bg-cream/10 border-2 border-gold/30 rounded-2xl p-6">
            <h2 className="text-gold text-3xl font-bold mb-5">Formula</h2>

            <div className="space-y-3">
              <ResultRow label="Lift needed" value={liftLabel(result.liftNeeded)} />
              <ResultRow label="Method" value={result.method} />
              {result.developer && <ResultRow label="Developer" value={result.developer} />}
              {result.mixRatio && <ResultRow label="Mix ratio" value={result.mixRatio} />}
              {result.underlyingPigment && (
                <ResultRow label="Underlying pigment" value={result.underlyingPigment} />
              )}
              {result.neutralizingTone && (
                <ResultRow label="Neutralize with" value={result.neutralizingTone} />
              )}
              <ResultRow label="Desired tone" value={toneLabel(result.desiredTone)} />
            </div>

            {/* Acceptable alternative (e.g. high-lift on healthy virgin lift-3) */}
            {result.alternativeMethod && (
              <div className="mt-6 border-2 border-cream/30 rounded-xl p-5">
                <p className="text-gold text-xl font-bold mb-2">Also acceptable</p>
                <p className="text-cream text-2xl font-bold">{result.alternativeMethod.method}</p>
                <p className="text-cream text-xl mt-1">
                  {result.alternativeMethod.developer} · {result.alternativeMethod.mixRatio}
                </p>
                <p className="text-cream/80 text-lg mt-1">{result.alternativeMethod.note}</p>
              </div>
            )}
          </div>

          {/* Warnings — loud, bordered, impossible to miss */}
          {result.warnings.length > 0 && (
            <div className="mt-6 space-y-4">
              {result.warnings.map((w, i) => (
                <div key={i} className="border-4 border-gold bg-gold/20 rounded-2xl p-6">
                  <p className="text-cream text-2xl font-bold leading-snug">⚠ {w}</p>
                </div>
              ))}
            </div>
          )}

          {/* Multi-session flag — strongest treatment (dark text on gold) */}
          {result.multiSession && (
            <div className="mt-6 border-4 border-gold bg-gold text-ink rounded-2xl p-6">
              <p className="text-2xl font-bold leading-snug">
                ⚠ Plan for more than one session — do not try to reach the goal in a single visit.
              </p>
            </div>
          )}

          {/* AI explanation */}
          <button
            onClick={explainFormula}
            disabled={explaining}
            className={
              explaining
                ? "w-full bg-cream/10 text-cream/40 text-2xl font-bold py-5 rounded-2xl mt-8 cursor-not-allowed"
                : "w-full bg-gold/20 text-gold border-2 border-gold/50 text-2xl font-bold py-5 rounded-2xl mt-8 hover:bg-gold/30 transition-colors"
            }
          >
            {explaining ? "Thinking…" : "💡 Explain this"}
          </button>

          {explanation && (
            <div className="mt-6 bg-cream/10 border-2 border-gold/30 rounded-2xl p-6">
              <p className="text-gold text-xl font-bold mb-3">Why this formula</p>
              <p className="text-cream text-xl leading-relaxed whitespace-pre-line">{explanation}</p>
            </div>
          )}

          <button
            onClick={startOver}
            className="w-full text-cream border-2 border-cream/30 text-2xl font-bold py-5 rounded-2xl mt-8 hover:border-cream/60 transition-colors"
          >
            Start over
          </button>
        </div>
      )}
    </section>
  );
}

// One label/value line in the results card
function ResultRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline gap-4 border-b border-cream/10 pb-3">
      <span className="text-cream/80 text-xl">{label}</span>
      <span className="text-cream text-2xl font-bold text-right">{value}</span>
    </div>
  );
}

// useSearchParams requires a Suspense boundary during prerender
export default function ColorToolPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-screen px-6 pt-28 max-w-3xl mx-auto">
          <p className="text-cream text-2xl">Loading…</p>
        </section>
      }
    >
      <ColorToolForm />
    </Suspense>
  );
}