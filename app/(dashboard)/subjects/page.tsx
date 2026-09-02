import { connectDB, Subject, Material } from "@/lib/database";
import { BookOpen, Beaker, Code, Calculator, Palette, Scale, Lightbulb, Download, FileText, Search, Star } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import SubjectsFilterSidebar from "@/components/subjects/SubjectsFilterSidebar";
import SubjectsToolbar from "@/components/subjects/SubjectsToolbar";
import SubjectCard, { type SubjectCardData } from "@/components/subjects/SubjectCard";
import { formatCount, subjectsHref, type SubjectQuery } from "@/components/subjects/query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subjects - GetMaterials",
  description: "Explore subjects and find the best study materials for your courses.",
  openGraph: {
    title: "Subjects - GetMaterials",
    description: "Explore subjects and find the best study materials for your courses.",
    type: "website",
  },
};

const PAGE_SIZE = 12;

const popularIcons: Record<string, typeof BookOpen> = {
  science: Beaker,
  engineering: Code,
  arts: Palette,
  commerce: Calculator,
  medical: Lightbulb,
  law: Scale,
  general: BookOpen,
};

interface Props {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}

export default async function SubjectsPage({ searchParams }: Props) {
  const params = await searchParams;
  await connectDB();

  const current: SubjectQuery = {
    q: params.q,
    category: params.category,
    sort: params.sort,
    view: params.view,
  };

  const filter: Record<string, unknown> = { isActive: true };
  if (params.category) filter.category = params.category;
  if (params.q?.trim()) {
    filter.name = { $regex: params.q.trim(), $options: "i" };
  }

  const sortKey = params.sort || "az";
  const sort: Record<string, 1 | -1> =
    sortKey === "za"
      ? { name: -1 }
      : sortKey === "materials"
        ? { materialsCount: -1, name: 1 }
        : sortKey === "newest"
          ? { createdAt: -1 }
          : { name: 1 };

  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const view = params.view === "list" ? "list" : "grid";

  const [
    totalMatching,
    subjects,
    totalSubjects,
    categoryAgg,
    popular,
    materialStats,
    ratingBySubject,
  ] = await Promise.all([
    Subject.countDocuments(filter),
    Subject.find(filter).sort(sort).skip(skip).limit(PAGE_SIZE).lean(),
    Subject.countDocuments({ isActive: true }),
    Subject.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }]),
    Subject.find({ isActive: true }).sort({ materialsCount: -1, name: 1 }).limit(5).lean(),
    Material.aggregate([
      { $match: { status: "published", isPublic: true } },
      {
        $group: {
          _id: null,
          materials: { $sum: 1 },
          downloads: { $sum: "$downloads" },
          ratingAvg: { $avg: "$rating.average" },
        },
      },
    ]),
    Material.aggregate([
      { $match: { status: "published", isPublic: true, "rating.count": { $gt: 0 } } },
      {
        $group: {
          _id: "$subject",
          ratingAverage: { $avg: "$rating.average" },
          ratingCount: { $sum: "$rating.count" },
        },
      },
    ]),
  ]);

  const categoryCounts: Record<string, number> = {};
  for (const row of categoryAgg as { _id: string; count: number }[]) {
    if (row._id) categoryCounts[row._id] = row.count;
  }

  const ratingMap = new Map(
    (ratingBySubject as any[]).map((row) => [
      String(row._id),
      { ratingAverage: row.ratingAverage as number, ratingCount: row.ratingCount as number },
    ])
  );

  const cards: SubjectCardData[] = subjects.map((subject: any) => {
    const rating = ratingMap.get(String(subject._id));
    return {
      id: String(subject._id),
      name: subject.name,
      slug: subject.slug,
      category: subject.category || "general",
      materialsCount: subject.materialsCount || 0,
      ratingAverage: rating?.ratingAverage,
      ratingCount: rating?.ratingCount,
    };
  });

  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
  const stats = materialStats[0] || { materials: 0, downloads: 0, ratingAvg: 0 };
  const queryForPage = (nextPage: number) => subjectsHref(current, { page: String(nextPage) });

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-sm text-slate-400 mb-4">
        <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-600">Subjects</span>
      </p>

      <div className="flex items-start gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Subjects</h1>
          <p className="text-slate-500 mt-1">
            Explore subjects and find the best study materials for your courses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: BookOpen, tint: "bg-violet-50 text-violet-600", value: totalSubjects ? `${formatCount(totalSubjects)}+` : "0", label: "Total Subjects" },
          { icon: FileText, tint: "bg-emerald-50 text-emerald-600", value: stats.materials ? `${formatCount(stats.materials)}+` : "0", label: "Study Materials" },
          { icon: Download, tint: "bg-orange-50 text-orange-600", value: stats.downloads ? `${formatCount(stats.downloads)}+` : "0", label: "Total Downloads" },
          { icon: Star, tint: "bg-amber-50 text-amber-600", value: stats.ratingAvg ? Number(stats.ratingAvg).toFixed(1) : "—", label: "Average Rating" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.tint}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">{item.value}</p>
              <p className="text-[11px] text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_260px] gap-6 items-start">
        <SubjectsFilterSidebar current={current} categoryCounts={categoryCounts} total={totalSubjects} />

        <div>
          <SubjectsToolbar current={current} />
          {cards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center mt-5">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No subjects match your filters.</p>
              <Link href="/subjects" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className={view === "grid" ? "mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "mt-5 space-y-3"}>
              {cards.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} view={view} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              {page > 1 && (
                <Link href={queryForPage(page - 1)} className="w-8 h-8 rounded-full text-sm flex items-center justify-center hover:bg-white">
                  ‹
                </Link>
              )}
              {pageNumbers(page, totalPages).map((n, index) =>
                n === "…" ? (
                  <span key={`e${index}`} className="px-2 text-slate-400">…</span>
                ) : (
                  <Link
                    key={n}
                    href={queryForPage(n)}
                    className={`min-w-8 h-8 px-2 rounded-full text-sm font-semibold flex items-center justify-center ${
                      n === page ? "bg-[var(--primary)] text-white" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {n}
                  </Link>
                )
              )}
              {page < totalPages && (
                <Link href={queryForPage(page + 1)} className="w-8 h-8 rounded-full text-sm flex items-center justify-center hover:bg-white">
                  ›
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Popular Subjects</h3>
              <Link href="/subjects?sort=materials" className="text-xs font-semibold text-[var(--primary)]">
                View all
              </Link>
            </div>
            {popular.length === 0 ? (
              <p className="text-xs text-slate-400">No subjects yet.</p>
            ) : (
              <div className="space-y-3">
                {popular.map((subject: any, index: number) => {
                  const Icon = popularIcons[subject.category] || BookOpen;
                  return (
                    <Link
                      key={String(subject._id)}
                      href={`/subjects/${subject.slug}`}
                      className="flex items-center gap-3 rounded-xl px-1 py-1 hover:bg-slate-50"
                    >
                      <span className="w-5 text-xs font-bold text-slate-400">{index + 1}</span>
                      <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{subject.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {formatCount(subject.materialsCount || 0)} materials
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-violet-50 border border-violet-100 p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white text-[var(--primary)] flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-900 text-sm">Can&apos;t find the subject you&apos;re looking for?</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Request it and we&apos;ll add materials when we can.</p>
            <Link
              href="/requests"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90"
            >
              Request Subject
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function pageNumbers(page: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: Array<number | "…"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) items.push("…");
  for (let n = start; n <= end; n++) items.push(n);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}
