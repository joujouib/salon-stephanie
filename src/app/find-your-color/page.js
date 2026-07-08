import { displayFont } from "../fonts";
import { prisma } from "@/lib/prisma";
import ColorQuiz from "@/components/ColorQuiz";

export const dynamic = "force-dynamic";

export default async function FindYourColorPage() {
  const colors = await prisma.color.findMany({
    where: { isActive: true },
  });

  return (
    <section className="min-h-screen px-6 pt-28 pb-16 max-w-5xl mx-auto">
      <h1 className={`${displayFont.className} text-gold text-5xl font-bold text-center`}>
        Find Your Color
      </h1>
      <p className="text-cream/70 text-center mt-3 max-w-xl mx-auto">
        Answer two quick questions and we'll suggest shades that may suit you.
      </p>

      <ColorQuiz colors={colors} />
    </section>
  );
}