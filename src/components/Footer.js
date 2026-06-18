import { displayFont } from "@/app/fonts";

export default function Footer() {
  return (
    <footer className="border-t border-gold/20 mt-20 px-6 py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

        {/* Brand */}
        <div>
          <h3 className={`${displayFont.className} text-gold text-2xl font-bold`}>
            Salon Stephanie
          </h3>
          <p className="text-cream/60 text-sm mt-2">
            Hair & makeup, crafted with care in Beirut.
          </p>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-gold text-sm uppercase tracking-wider mb-3">Hours</h4>
          <ul className="text-cream/70 text-sm space-y-1">
            <li>Mon – Sat: 9:00 – 18:00</li>
            <li>Sunday: Closed</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-gold text-sm uppercase tracking-wider mb-3">Contact</h4>
          <ul className="text-cream/70 text-sm space-y-1">
            <li>Joub jannine, Lebanon</li>
            <li>+961 03 676 414</li>
          </ul>
        </div>

      </div>

      <p className="text-cream/40 text-xs text-center mt-10">
        © {new Date().getFullYear()} Salon Stephanie. All rights reserved.
      </p>
    </footer>
  );
}