"use client";

import { useState } from "react";

export default function ColorQuiz({ colors }) {
  const [undertone, setUndertone] = useState("");
  const [hairDarkness, setHairDarkness] = useState("");
  const [showResults, setShowResults] = useState(false);

  // The matching logic
  function getRecommendations() {
    return colors
      .map((color) => {
        let score = 0;

        // Undertone match: same undertone = great, neutral = always fine
        if (color.undertone === undertone) score += 2;
        else if (color.undertone === "neutral" || undertone === "neutral") score += 1;

        // Is it achievable on their hair?
        const suitable = color.suitableFor.split(",");
        const achievable = suitable.includes(hairDarkness);
        if (achievable) score += 1;

        return { ...color, score, achievable };
      })
      .filter((color) => color.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  const canSubmit = undertone && hairDarkness;
  const recommendations = showResults ? getRecommendations() : [];

  function reset() {
    setUndertone("");
    setHairDarkness("");
    setShowResults(false);
  }

  // RESULTS VIEW
  if (showResults) {
    return (
      <div className="mt-10">
        <h2 className="text-gold text-2xl font-semibold text-center mb-2">
          Colors that may suit you
        </h2>
        <p className="text-cream/50 text-sm text-center mb-8">
          A guide to get you started — Stephanie will find your perfect shade in person.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {recommendations.map((color) => (
            <div key={color.id} className="bg-cream/5 border border-gold/20 rounded-xl overflow-hidden">
              <div className="h-28 w-full" style={{ backgroundColor: color.hex }}></div>
              <div className="p-4">
                <h3 className="text-gold text-lg font-semibold">{color.name}</h3>
                {color.achievable ? (
                  <p className="text-cream/60 text-xs mt-2">✓ Achievable on your hair</p>
                ) : (
                  <p className="text-cream/60 text-xs mt-2">Achievable with pre-lightening ✨</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={reset}
            className="border border-gold/40 text-gold px-6 py-2 rounded-full text-sm hover:bg-gold/10 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // QUIZ VIEW
  return (
    <div className="mt-10 max-w-lg mx-auto">
      {/* Undertone question */}
      <div className="mb-8">
        <h3 className="text-gold text-lg font-semibold mb-3">
          What's your skin undertone?
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { value: "warm", label: "Warm (golden, yellow, peachy)" },
            { value: "cool", label: "Cool (pink, red, bluish)" },
            { value: "neutral", label: "Neutral / not sure" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setUndertone(opt.value)}
              className={
                undertone === opt.value
                  ? "bg-gold text-ink px-4 py-3 rounded-lg text-left text-sm font-medium"
                  : "bg-cream/5 text-cream/80 px-4 py-3 rounded-lg text-left text-sm border border-cream/20 hover:border-gold/40 transition-colors"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hair darkness question */}
      <div className="mb-8">
        <h3 className="text-gold text-lg font-semibold mb-3">
          What's your natural hair color?
        </h3>
        <div className="flex flex-col gap-2">
          {[
            { value: "light", label: "Light (blonde, light brown)" },
            { value: "medium", label: "Medium (brown)" },
            { value: "dark", label: "Dark (dark brown, black)" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setHairDarkness(opt.value)}
              className={
                hairDarkness === opt.value
                  ? "bg-gold text-ink px-4 py-3 rounded-lg text-left text-sm font-medium"
                  : "bg-cream/5 text-cream/80 px-4 py-3 rounded-lg text-left text-sm border border-cream/20 hover:border-gold/40 transition-colors"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={() => setShowResults(true)}
        disabled={!canSubmit}
        className={
          canSubmit
            ? "w-full bg-gold text-ink px-6 py-3 rounded-full font-semibold hover:bg-gold-light transition-colors"
            : "w-full bg-cream/10 text-cream/40 px-6 py-3 rounded-full font-semibold cursor-not-allowed"
        }
      >
        See my colors
      </button>
    </div>
  );
}