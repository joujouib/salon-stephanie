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
            {/* The hair-strand swatch, tinted with the color */}
            <div className="relative h-40 w-full overflow-hidden">
              {/* Base hair strand image */}
              <img
                src="/hair-strand.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Color tint blended over the strands */}
              <div
                className="absolute inset-0 mix-blend-multiply"
                style={{ backgroundColor: color.hex }}
              ></div>
              {/* Shine layer */}
              <div
                className="absolute inset-0 mix-blend-soft-light opacity-50"
                style={{ backgroundColor: color.hex }}
              ></div>
              {/* For very dark colors, lift the texture back so strands show */}
              <div
                className="absolute inset-0 mix-blend-overlay opacity-30"
                style={{ backgroundColor: "#888888" }}
              ></div>
            </div>

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