"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  const colorsRef = useRef(null);

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    {
      label: "Colors",
      children: [
        { href: "/colors", label: "Explore Colors" },
        { href: "/find-your-color", label: "Find Your Color" },
      ],
    },
    { href: "/queue", label: "Queue" },
    { href: "/about", label: "About" },
  ];

  // Close the desktop "Colors" dropdown when clicking anywhere outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (colorsRef.current && !colorsRef.current.contains(e.target)) {
        setColorsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="absolute top-0 left-0 w-full px-6 py-5 z-20">
      <div className="flex items-center justify-between">

        {/* Salon name */}
        <Link href="/" className="text-gold text-xl font-bold tracking-wide">
          Salon Stephanie
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex gap-6 text-cream/80 text-sm">
          {links.map((link) =>
            link.children ? (
              <div key={link.label} className="relative" ref={colorsRef}>
                <button
                  onClick={() => setColorsOpen(!colorsOpen)}
                  className="flex items-center gap-1 hover:text-gold transition-colors"
                >
                  {link.label}
                  <span className="text-xs">▾</span>
                </button>
                {colorsOpen && (
                  <div className="absolute left-0 mt-2 min-w-[160px] bg-ink border border-gold/30 rounded-xl py-2 z-30">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setColorsOpen(false)}
                        className="block px-4 py-2 text-cream/80 hover:text-gold transition-colors whitespace-nowrap"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={link.href} href={link.href} className="hover:text-gold transition-colors">
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* Hamburger button — shown only on mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gold text-2xl"
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="md:hidden flex flex-col gap-4 mt-4 pb-2 text-cream/80">
          {links.map((link) =>
            link.children ? (
              <div key={link.label} className="flex flex-col gap-2">
                <span className="text-gold/70">{link.label}</span>
                {link.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setIsOpen(false)}
                    className="pl-4 hover:text-gold transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="hover:text-gold transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      )}

    </nav>
  );
}
