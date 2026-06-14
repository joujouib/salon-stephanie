"use client";

import { useState } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

const portfolio = [
  { id: 1, title: "Honey Blonde Balayage", category: "Color",
    before: "https://placehold.co/600x700/3D2B1F/ffffff?text=Before",
    after:  "https://placehold.co/600x700/C9A84C/0D0D0D?text=After" },
  { id: 2, title: "Soft Layered Cut", category: "Cut",
    before: "https://placehold.co/600x700/3D2B1F/ffffff?text=Before",
    after:  "https://placehold.co/600x700/C9A84C/0D0D0D?text=After" },
  { id: 3, title: "Bridal Glam", category: "Makeup",
    before: "https://placehold.co/600x700/3D2B1F/ffffff?text=Before",
    after:  "https://placehold.co/600x700/C9A84C/0D0D0D?text=After" },
  { id: 4, title: "Copper Highlights", category: "Color",
    before: "https://placehold.co/600x700/3D2B1F/ffffff?text=Before",
    after:  "https://placehold.co/600x700/C9A84C/0D0D0D?text=After" },
];

const categories = ["All", "Color", "Cut", "Makeup"];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const visible =
    activeCategory === "All"
      ? portfolio
      : portfolio.filter((item) => item.category === activeCategory);

  return (
    <section className="min-h-screen px-6 pt-28 pb-16 max-w-5xl mx-auto">

      <h1 className="text-gold text-5xl font-bold text-center">Portfolio</h1>
      <p className="text-cream/70 text-center mt-3">Drag each image to reveal the transformation.</p>

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

      {/* Before/after gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {visible.map((item) => (
          <div key={item.id} className="rounded-xl overflow-hidden border border-gold/20">
            <ReactCompareSlider
              itemOne={<ReactCompareSliderImage src={item.before} alt={`${item.title} before`} />}
              itemTwo={<ReactCompareSliderImage src={item.after} alt={`${item.title} after`} />}
            />
            <div className="flex justify-between items-center p-4">
              <h2 className="text-gold text-lg font-semibold">{item.title}</h2>
              <span className="text-cream/50 text-xs uppercase tracking-wider">{item.category}</span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}