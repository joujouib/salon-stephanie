import { displayFont } from "../fonts";

const team = [
  { id: 1, name: "Stephanie", role: "Founder & Lead Stylist" },
  { id: 2, name: "Helper One", role: "Stylist" },
  { id: 3, name: "Helper Two", role: "Stylist & Makeup" },
];

export default function AboutPage() {
  return (
    <section className="min-h-screen px-6 pt-28 pb-16 max-w-4xl mx-auto">

      {/* Story */}
      <h1 className={`${displayFont.className} text-gold text-5xl font-bold text-center`}>
        About Salon Stephanie
      </h1>

      <div className="w-24 h-px bg-gold mx-auto my-8"></div>

      <p className="text-cream/80 text-lg leading-relaxed text-center max-w-2xl mx-auto">
        For years, Salon Stephanie has been a place where women in Beirut come
        to feel cared for. What began as one chair and a deep love for the craft
        has grown into a warm, trusted space for hair and makeup — built on
        skill, patience, and genuine attention to every client who walks in.
      </p>

      <p className="text-cream/70 leading-relaxed text-center max-w-2xl mx-auto mt-6">
        We welcome everyone, in any language, and we take our time to get it
        right. No rush, no shortcuts — just honest work and a result you love.
      </p>

      {/* Team */}
      <h2 className={`${displayFont.className} text-gold text-3xl font-bold text-center mt-20`}>
        Meet the Team
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {team.map((member) => (
          <div
            key={member.id}
            className="bg-cream/5 border border-gold/20 rounded-xl p-6 text-center hover:border-gold/50 transition-colors"
          >
            {/* Placeholder avatar circle */}
            <div className="w-24 h-24 rounded-full bg-gold/20 border border-gold/40 mx-auto flex items-center justify-center">
              <span className={`${displayFont.className} text-gold text-3xl`}>
                {member.name.charAt(0)}
              </span>
            </div>
            <h3 className="text-gold text-xl font-semibold mt-4">{member.name}</h3>
            <p className="text-cream/60 text-sm mt-1">{member.role}</p>
          </div>
        ))}
      </div>

    </section>
  );
}