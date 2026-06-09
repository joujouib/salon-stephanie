import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="bg-ink min-h-screen text-cream">
      <Navbar />
      <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-gold text-5xl font-bold">About</h1>
        <p className="text-cream/80 mt-4">Stephanie's story and the team will appear here.</p>
      </section>
    </main>
  );
}