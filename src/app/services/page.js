import { displayFont } from "../fonts";
import { prisma } from "@/lib/prisma";
import ServicesList from "@/components/ServicesList";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { category: "asc" },
  });

  return (
    <section className="min-h-screen px-6 pt-28 pb-16 max-w-5xl mx-auto">
      <h1 className={`${displayFont.className} text-gold text-5xl font-bold text-center`}>Services</h1>
      <p className="text-cream/70 text-center mt-3">Hair & makeup, priced with care.</p>

      <ServicesList services={services} />
    </section>
  );
}