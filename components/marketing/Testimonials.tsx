import Link from "next/link";

export default function Testimonials() {
  const testimonials = [
    { name: "Harshitha", role: "B.Tech Student", text: "GetMaterials saved me so much time during exam prep. I found all the handwritten notes I needed for Mathematics and Chemistry in one place. Highly recommend!", rating: 5 },
    { name: "Sai Reddy", role: "ECE Student", text: "The web development course materials are incredibly well-organized. I went from zero to building my first website using the free resources here.", rating: 5 },
    { name: "Vardhan", role: "B.Tech Student", text: "I love how the materials are curated by real teachers. The quality is much better than random PDFs you find online. And it's completely free!", rating: 5 },
    { name: "Ramani", role: "Web Developer", text: "As a teacher, I upload my notes here to help students beyond my classroom. The platform is simple and the students genuinely appreciate it.", rating: 5 },
  ];

  return (
    <section className="section bg-gradient-soft">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Loved by students &amp; teachers</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Don&apos;t just take our word for it. Here&apos;s what our community says.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                  {t.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/feedback" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] border border-[var(--primary)] px-5 py-2 rounded-full hover:bg-[var(--primary)] hover:text-white transition">
            Give your feedback →
          </Link>
        </div>
      </div>
    </section>
  );
}
