"use client";

import { useState } from "react";

const categories = ["All", "Hair", "Makeup"];

export default function ServicesList({ services }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleServices =
    activeCategory === "All"
      ? services
      : services.filter((service) => service.category === activeCategory);

  return (
    <>
      {/* Filter buttons */}
      <div className="flex justify-center gap-3 mt-10">
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

      {/* Service cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {visibleServices.map((service) => (
          <div
            key={service.id}
            className="bg-cream/5 border border-gold/20 rounded-xl p-6 hover:border-gold/60 transition-colors"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-gold text-2xl font-semibold">{service.name}</h2>
              <span className="text-cream/50 text-xs uppercase tracking-wider border border-cream/20 rounded-full px-3 py-1">
                {service.category}
              </span>
            </div>
            <div className="flex justify-between items-center mt-6 text-cream/80">
              <span className="text-xl">${service.priceMin}–{service.priceMax}</span>
              <span className="text-sm text-cream/50">{service.duration} min</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}