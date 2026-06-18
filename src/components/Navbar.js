"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/queue", label: "Queue" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="absolute top-0 left-0 w-full px-6 py-5 z-20">
      <div className="flex items-center justify-between">

        {/* Salon name */}
        <Link href="/" className="text-gold text-xl font-bold tracking-wide">
          Salon Stephanie
        </Link>

        {/* Desktop links — hidden on mobile */}
        <div className="hidden md:flex gap-6 text-cream/80 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
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
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

    </nav>
  );
}