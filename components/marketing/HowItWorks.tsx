import { FaSearch, FaBookReader, FaDownload, FaCertificate } from "react-icons/fa";

const steps = [
  { num: "01", icon: FaSearch, title: "Search or Browse", desc: "Find materials by subject, topic, or keyword. Browse through categories like Mathematics, Web Development, Chemistry and more.", color: "bg-blue-50 text-blue-600" },
  { num: "02", icon: FaBookReader, title: "Read & Learn", desc: "Open any material instantly in the browser. PDF notes, guides, video lectures — all accessible without downloading.", color: "bg-green-50 text-green-600" },
  { num: "03", icon: FaDownload, title: "Download for Free", desc: "Save materials to your device for offline study. Every resource is free. No premium locks, no credit card needed.", color: "bg-amber-50 text-amber-600" },
  { num: "04", icon: FaCertificate, title: "Track & Grow", desc: "Create an account to bookmark favorites, request topics from teachers, and track your learning progress.", color: "bg-purple-50 text-purple-600" },
];

export default function HowItWorks() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">How It Works</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start learning in 4 simple steps</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            No complex setup. No registration required to browse. Just find what you need and start studying.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="text-xs font-extrabold text-gray-300 mb-3">{step.num}</div>
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4`}>
                  <step.icon className="text-xl" />
                </div>
                <h3 className="font-bold text-[15px] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
