import Link from "next/link";
import { FaChalkboardTeacher, FaUpload, FaChartLine } from "react-icons/fa";

export default function ForTeachers() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">For Teachers</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Share your knowledge with thousands of students</h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Join our growing community of educators. Upload your notes, assignments, and guides to help students beyond your classroom. Build your reputation and make an impact.
            </p>
            <div className="space-y-4 mb-8">
              {[
                { icon: FaUpload, title: "Easy Upload", desc: "Drag and drop your PDFs, documents, and files. We handle the rest." },
                { icon: FaChartLine, title: "Track Impact", desc: "See how many students download and use your materials." },
                { icon: FaChalkboardTeacher, title: "Build Reputation", desc: "Get verified teacher status and grow your profile in the community." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(177,0,255,0.08)] flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[15px]">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="inline-flex bg-[var(--primary)] text-white font-bold px-6 py-3 rounded-xl text-sm shadow-[0_4px_14px_rgba(177,0,255,0.25)] hover:-translate-y-0.5 transition-all"
            >
              Start Teaching on GetMaterials
            </Link>
          </div>

          <div className="bg-[rgba(177,0,255,0.04)] rounded-3xl p-8 md:p-10">
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold">SM</div>
                  <div>
                    <p className="text-sm font-semibold">Prof. Suneel Mekala</p>
                    <p className="text-xs text-gray-400">Uploaded 2 hours ago</p>
                  </div>
                </div>
                <p className="text-sm font-semibold mb-1">Data Structures — Complete Notes</p>
                <p className="text-xs text-gray-400">PDF • 45 pages • Web Development</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span>📥 342 downloads</span>
                  <span>⭐ 4.9 rating</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">PS</div>
                  <div>
                    <p className="text-sm font-semibold">Prof. Sujatha</p>
                    <p className="text-xs text-gray-400">Uploaded yesterday</p>
                  </div>
                </div>
                <p className="text-sm font-semibold mb-1">Organic Chemistry — Chapter 5</p>
                <p className="text-xs text-gray-400">PDF • 28 pages • Chemistry</p>
                <div className="flex gap-4 mt-3 text-xs text-gray-400">
                  <span>📥 198 downloads</span>
                  <span>⭐ 4.8 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
