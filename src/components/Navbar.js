import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-5 z-10">

      {/* Salon name / logo on the left */}
      <Link href="/" className="text-gold text-xl font-bold tracking-wide">
        Salon Stephanie
      </Link>

      {/* Navigation links on the right */}
      <div className="flex gap-6 text-cream/80 text-sm">
        <Link href="/" className="hover:text-gold transition-colors">Home</Link>
        <Link href="/services" className="hover:text-gold transition-colors">Services</Link>
        <Link href="/queue" className="hover:text-gold transition-colors">Queue</Link>
        <Link href="/about" className="hover:text-gold transition-colors">About</Link>
      </div>

    </nav>
  );
}