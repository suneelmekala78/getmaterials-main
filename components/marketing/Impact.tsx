import Link from "next/link";
import { FaChartBar, FaDownload, FaUsers, FaGlobeAsia } from "react-icons/fa";

const cards = [
  {
    icon: FaChartBar,
    value: "12K+",
    title: "Materials Shared",
    hint: "By our community",
    tint: "text-[#7C3AED]",
  },
  {
    icon: FaDownload,
    value: "2.4L+",
    title: "Downloads",
    hint: "This month",
    tint: "text-[#16A34A]",
  },
  {
    icon: FaUsers,
    value: "25K+",
    title: "Active Users",
    hint: "Every month",
    tint: "text-[#EA580C]",
  },
  {
    icon: FaGlobeAsia,
    value: "All India",
    title: "Presence",
    hint: "From 500+ cities",
    tint: "text-[#2563EB]",
  },
];

export default function Impact() {
  return (
    <section id="impact" className="section pt-6 scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-[#F4EEFF] rounded-[32px] px-6 py-10 md:px-10 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
            <div>
              <p className="text-[var(--primary)] font-bold text-[11px] uppercase tracking-[0.18em] mb-3">
                Our Impact
              </p>
              <h2 className="text-3xl md:text-[38px] font-extrabold mb-4 leading-tight text-[#111]">
                Making a Difference
              </h2>
              <p className="text-gray-700 leading-relaxed mb-8 max-w-sm">
                Together, we are building the largest free study resource platform in India.
              </p>
              <Link
                href="/materials"
                className="inline-flex items-center gap-2 border-2 border-[var(--primary)] text-[var(--primary)] font-bold px-5 py-2.5 rounded-xl text-[15px] bg-white hover:bg-[var(--primary)] hover:text-white transition-all"
              >
                <FaChartBar className="text-sm" />
                See Our Impact
              </Link>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {cards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(88,44,190,0.06)] p-4 min-h-[150px]"
                >
                  <card.icon className={`text-xl mb-3 ${card.tint}`} />
                  <p className="text-[22px] font-extrabold text-[#111] leading-none">{card.value}</p>
                  <p className="font-bold text-sm mt-2 text-[#111]">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{card.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
