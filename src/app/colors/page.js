import { displayFont } from "../fonts";
import { prisma } from "@/lib/prisma";
import ColorExplorer from "@/components/ColorExplorer";

export const dynamic = "force-dynamic";

export default async function ColorsPage() {
  const colors = await prisma.color.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  });

  return (
    <section className="min-h-screen px-6 pt-28 pb-16 max-w-5xl mx-auto">
      <h1 className={`${displayFont.className} text-gold text-5xl font-bold text-center`}>
        Our Colors
      </h1>
      <p className="text-cream/70 text-center mt-3 max-w-xl mx-auto">
        Explore our shades. Come visit and Stephanie will help you find the perfect color for you.
      </p>

      <ColorExplorer colors={colors} />
    </section>
  );
}