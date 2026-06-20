import { FaCalculator, FaGlobe, FaFlask, FaBookOpen, FaAtom, FaCode, FaPython, FaReact } from "react-icons/fa";
import Link from "next/link";

const subjects = [
  { icon: FaCalculator, title: "Mathematics", count: "200+ notes", color: "bg-blue-50 text-blue-600" },
  { icon: FaBookOpen, title: "English", count: "150+ notes", color: "bg-green-50 text-green-600" },
  { icon: FaGlobe, title: "Web Development", count: "300+ files", color: "bg-violet-50 text-violet-600" },
  { icon: FaFlask, title: "Chemistry", count: "180+ notes", color: "bg-amber-50 text-amber-600" },
  { icon: FaAtom, title: "Physics", count: "160+ notes", color: "bg-cyan-50 text-cyan-600" },
  { icon: FaPython, title: "Python", count: "120+ files", color: "bg-yellow-50 text-yellow-700" },
  { icon: FaCode, title: "Java", count: "100+ files", color: "bg-red-50 text-red-600" },
  { icon: FaReact, title: "React", count: "90+ files", color: "bg-sky-50 text-sky-600" },
];

export default function Subjects() {
  return (
    <section className="section">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-2">Popular Subjects</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Browse by subject</h2>
          </div>
          <Link
            href="/materials"
            className="text-sm font-semibold text-[var(--primary)] border border-[var(--primary)] px-4 py-2 rounded-lg hover:bg-[var(--primary)] hover:text-white transition"
          >
            View all subjects →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {subjects.map((s) => (
            <Link
              key={s.title}
              href="/materials"
              className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[rgba(177,0,255,0.15)] hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="text-lg" />
              </div>
              <h3 className="font-bold text-[15px] group-hover:text-[var(--primary)] transition-colors">{s.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{s.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
