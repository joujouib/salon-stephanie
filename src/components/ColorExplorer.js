"use client";

import { useState } from "react";

const categories = ["All", "Blonde", "Brown", "Red", "Black"];

export default function ColorExplorer({ colors }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleColors =
    activeCategory === "All"
      ? colors
      : colors.filter((color) => color.category === activeCategory);

  return (
    <>
      {/* Filter buttons */}
      <div className="flex justify-center flex-wrap gap-3 mt-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={
              activeCategory === category
                ? "bg-gold text-ink px-5 py-2 rounded-full text-sm font-semibold transition-colors"
                : "bg-cream/5 text-cream/70 px-5 py-2 rounded-full text-sm border border-cream/20 hover:border-gold/50 transition-colors"
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* Color cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-10">
        {visibleColors.map((color) => (
          <div
            key={color.id}
            className="bg-cream/5 border border-gold/20 rounded-xl overflow-hidden hover:border-gold/60 transition-colors"
          >
            {/* The color swatch */}
            <div
              className="h-32 w-full"
              style={{ backgroundColor: color.hex }}
            ></div>

            {/* Color info */}
            <div className="p-4">
              <h3 className="text-gold text-lg font-semibold">{color.name}</h3>
              <p className="text-cream/50 text-xs uppercase tracking-wider mt-1">
                {color.category}
              </p>

              {/* Lightening flag */}
              {color.lighteningLevel === "heavy" && (
                <p className="text-cream/60 text-xs mt-3">
                  ⚠ Usually needs lightening
                </p>
              )}
              {color.lighteningLevel === "mild" && (
                <p className="text-cream/60 text-xs mt-3">
                  May need some lightening
                </p>
              )}
              {color.lighteningLevel === "none" && (
                <p className="text-cream/60 text-xs mt-3">
                  Works on most hair
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}