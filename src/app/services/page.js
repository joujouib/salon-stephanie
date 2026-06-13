"use client";

import { useState } from "react";

const services = [
  { id: 1, name: "Balayage", category: "Hair", price: "$70–90", duration: "90 min" },
  { id: 2, name: "Haircut & Style", category: "Hair", price: "$25–35", duration: "45 min" },
  { id: 3, name: "Highlights", category: "Hair", price: "$80–110", duration: "100 min" },
  { id: 4, name: "Blowdry", category: "Hair", price: "$20–25", duration: "30 min" },
  { id: 5, name: "Full Makeup", category: "Makeup", price: "$45–60", duration: "45 min" },
  { id: 6, name: "Bridal Makeup", category: "Makeup", price: "$90–120", duration: "75 min" },
];

const categories = ["All", "Hair", "Makeup"];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visibleServices =
    activeCategory === "All"
      ? services
      : services.filter((service) => service.category === activeCategory);

  return (
    <section className="min-h-screen px-6 pt-28 pb-16 max-w-5xl mx-auto">

      <h1 className="text-gold text-5xl font-bold text-center">Services</h1>
      <p className="text-cream/70 text-center mt-3">Hair & makeup, priced with care.</p>

      {/* Filter buttons */}
      <div className="flex justify-center gap-3 mt-10">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
  alert("clicked!");
  setActiveCategory(category);
}}
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
              <span className="text-xl">{service.price}</span>
              <span className="text-sm text-cream/50">{service.duration}</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}