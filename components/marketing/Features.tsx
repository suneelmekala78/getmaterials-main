import { FaBookOpen, FaDownload, FaUpload, FaShieldAlt, FaUsers, FaMobileAlt } from "react-icons/fa";

const features = [
  { icon: FaBookOpen, title: "Curated Study Materials", desc: "Notes, guides, worksheets and assignments organized by subject and topic. Every material is reviewed for quality before publishing." },
  { icon: FaUpload, title: "Teachers Upload Directly", desc: "Verified educators create and share materials. No middleman. Students get content straight from experienced teachers." },
  { icon: FaDownload, title: "Free Downloads", desc: "Every PDF, document and resource is free to download. No hidden paywalls, no premium tiers. Education should be accessible." },
  { icon: FaShieldAlt, title: "Verified & Trusted", desc: "All teachers go through a verification process. Materials are checked for accuracy so students can study with confidence." },
  { icon: FaUsers, title: "Growing Community", desc: "Join thousands of students and teachers building a free knowledge base together. Share feedback, request topics, grow together." },
  { icon: FaMobileAlt, title: "Works Everywhere", desc: "Access materials on your phone, tablet, or laptop. Responsive design means you can study anywhere, anytime — even offline." },
];

export default function Features() {
  return (
    <section className="section bg-gradient-soft">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">Why GetMaterials?</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything students need, in one place</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            We built GetMaterials because finding good study materials shouldn&apos;t be hard. Here&apos;s what makes us different.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center mb-4">
                <f.icon className="text-[var(--primary)] text-xl" />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
