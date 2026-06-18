import { displayFont } from "../fonts";

export default function QueuePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <h1 className={`${displayFont.className} text-gold text-5xl font-bold`}>Queue</h1>
      <p className="text-cream/80 mt-4">Live salon status will appear here.</p>
    </section>
  );
}