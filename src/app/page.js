import { displayFont } from "./layout";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <p className="text-gold tracking-[0.4em] text-sm mb-4">BEIRUT</p>
      <h1 className={`${displayFont.className} text-gold text-6xl md:text-7xl font-bold tracking-wide`}>
        Salon Stephanie
      </h1>
      <div className="w-24 h-px bg-gold my-6"></div>
      <p className="text-cream/80 text-lg max-w-md">
        Hair & makeup, crafted with care. Walk in and let us take care of the rest.
      </p>
      <button className="mt-10 bg-gold text-ink px-8 py-3 rounded-full font-semibold hover:bg-gold-light transition-colors">
        Check the Queue
      </button>
    </section>
  );
}