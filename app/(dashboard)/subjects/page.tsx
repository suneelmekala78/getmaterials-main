import { connectDB, Subject } from "@getmaterials/database";
import { Search, BookOpen, Beaker, Code, Calculator, Palette, Scale, Lightbulb } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Subjects - GetMaterials",
};

const categoryIcons: Record<string, any> = {
  science: Beaker,
  engineering: Code,
  arts: Palette,
  commerce: Calculator,
  medical: Lightbulb,
  law: Scale,
  general: BookOpen,
};

const categoryColors: Record<string, string> = {
  science: "from-emerald-500 to-teal-500",
  engineering: "from-blue-500 to-cyan-500",
  arts: "from-pink-500 to-rose-500",
  commerce: "from-amber-500 to-orange-500",
  medical: "from-red-500 to-pink-500",
  law: "from-indigo-500 to-purple-500",
  general: "from-violet-500 to-blue-500",
};

export default async function SubjectsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  await connectDB();

  const filter: Record<string, unknown> = { isActive: true };
  if (q?.trim()) {
    filter.name = { $regex: q.trim(), $options: "i" };
  }

  const subjects = await Subject.find(filter).sort({ name: 1 }).lean();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
        <p className="text-slate-500 mt-1">
          Browse all available subjects and find study materials
        </p>
      </div>

      {/* Search */}
      <form action="/subjects" method="GET" className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="Search subjects..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
        />
      </form>

      {/* Subjects grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject: any) => {
            const Icon = categoryIcons[subject.category] || BookOpen;
            const color = categoryColors[subject.category] || "from-violet-500 to-blue-500";

            return (
              <Link
                key={subject._id.toString()}
                href={`/subjects/${subject.slug}`}
                className="group bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:border-violet-100 hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                  {subject.name}
                </h3>
                {subject.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {subject.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                  <span>{subject.materialsCount || 0} materials</span>
                  <span className="capitalize">{subject.category}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No subjects available yet
          </h3>
          <p className="text-slate-500">
            Subjects will appear here once they are added by administrators.
          </p>
        </div>
      )}
    </div>
  );
}
