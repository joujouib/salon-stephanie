import Navbar from "@/components/Navbar";

export default function ServicesPage() {
  return (
    <main className="bg-ink min-h-screen text-cream">
      <Navbar />
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-gold text-5xl font-bold">Services</h1>
        <p className="text-cream/80 mt-4">Our hair and makeup services will appear here.</p>
      </section>
    </main>
  );
}