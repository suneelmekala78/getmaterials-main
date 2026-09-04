import { connectDB, Material, Subject, College, User } from "@/lib/database";
import { auth } from "@/lib/auth";
import {
  BookOpen,
  Building2,
  Download,
  Layers,
  Star,
  Upload,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import MaterialsToolbar from "@/components/materials/MaterialsToolbar";
import MaterialsFilterSidebar from "@/components/materials/MaterialsFilterSidebar";
import MaterialCard from "@/components/materials/MaterialCard";
import { listingMetadata } from "@/lib/seo";

export const metadata: Metadata = listingMetadata({
  title: "Browse Free Study Materials, Notes & PDFs",
  description:
    "Browse free study materials, handwritten notes, question papers, and video lectures uploaded by teachers on GetMaterials.",
  path: "/materials",
  keywords: [
    "free study materials",
    "download notes PDF",
    "question papers",
    "video lectures",
    "GetMaterials",
  ],
});

const PAGE_SIZE = 18;

const typeValues = ["pdf", "video", "link", "image", "assignment"] as const;
const categoryValues = [
  "notes",
  "question_paper",
  "syllabus",
  "assignment",
  "lab_manual",
  "reference",
  "other",
] as const;

interface Props {
  searchParams: Promise<{
    type?: string;
    category?: string;
    subject?: string;
    q?: string;
    tag?: string;
    sort?: string;
    view?: string;
    page?: string;
    semester?: string;
    college?: string;
  }>;
}

function formatStat(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L+`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K+`;
  return `${value}+`;
}

export default async function MaterialsPage({ searchParams }: Props) {
  const params = await searchParams;
  await connectDB();
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const filter: any = { status: "published", isPublic: true };
  if (params.type && typeValues.includes(params.type as any)) filter.type = params.type;
  if (params.category && categoryValues.includes(params.category as any)) {
    filter.materialCategory = params.category;
  }
  if (params.tag) filter.tags = params.tag.toLowerCase().trim();
  if (params.q) filter.title = { $regex: params.q, $options: "i" };
  if (params.semester) {
    const semester = Number(params.semester);
    if (semester >= 1 && semester <= 10) filter.semester = semester;
  }

  const collegeDoc = params.college
    ? await College.findOne({ code: params.college.toUpperCase() }).select("_id").lean()
    : null;
  if (collegeDoc) {
    const collegeId = (collegeDoc as any)._id;
    filter.$or = [{ college: collegeId }, { colleges: collegeId }];
  }

  const subjectDoc = params.subject
    ? await Subject.findOne({ slug: params.subject }).select("_id").lean()
    : null;
  if (subjectDoc) filter.subject = (subjectDoc as any)._id;

  const sortKey = params.sort || "latest";
  const sort: Record<string, 1 | -1> =
    sortKey === "popular"
      ? { views: -1, createdAt: -1 }
      : sortKey === "downloads"
        ? { downloads: -1, createdAt: -1 }
        : sortKey === "rating"
          ? { "rating.average": -1, createdAt: -1 }
          : { createdAt: -1 };

  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const published = { status: "published", isPublic: true };

  const [
    totalMatching,
    materials,
    totalMaterials,
    totalColleges,
    totalSubjects,
    aggregates,
    bookmarkUser,
    subjects,
  ] = await Promise.all([
    Material.countDocuments(filter),
    Material.find(filter)
      .populate("subject", "name slug")
      .populate("uploadedBy", "name role")
      .populate("college", "name")
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Material.countDocuments(published),
    College.countDocuments({}),
    Subject.countDocuments({}),
    Material.aggregate([
      { $match: published },
      {
        $group: {
          _id: null,
          downloads: { $sum: "$downloads" },
          avgRating: { $avg: "$rating.average" },
        },
      },
    ]),
    userId ? User.findById(userId).select("bookmarks").lean() : null,
    Subject.find({ isActive: true }).select("name slug").sort({ name: 1 }).lean(),
  ]);

  const totals = aggregates[0] || { downloads: 0, avgRating: 0 };
  const bookmarkedIds = new Set(
    ((bookmarkUser as any)?.bookmarks || []).map((id: any) => String(id))
  );
  const view = params.view === "list" ? "list" : "grid";
  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));

  const queryForPage = (nextPage: number) => {
    const query = new URLSearchParams();
    (["q", "type", "category", "subject", "tag", "sort", "view", "semester", "college"] as const).forEach((key) => {
      const value = params[key];
      if (value) query.set(key, value);
    });
    if (nextPage > 1) query.set("page", String(nextPage));
    const qs = query.toString();
    return qs ? `/materials?${qs}` : "/materials";
  };

  return (
    <main className="bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-400 mb-4">
          <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-600">Materials</span>
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">Materials</h1>
              <p className="text-slate-500 mt-1">
                Explore {formatStat(totalMaterials)} study materials shared by students and teachers.
              </p>
            </div>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 border-2 border-[var(--primary)] text-[var(--primary)] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[var(--primary)] hover:text-white transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Material
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { icon: BookOpen, label: "Total Materials", value: formatStat(totalMaterials) },
            { icon: Building2, label: "Colleges", value: formatStat(totalColleges) },
            { icon: Layers, label: "Subjects", value: formatStat(totalSubjects) },
            { icon: Download, label: "Downloads", value: formatStat(totals.downloads || 0) },
            {
              icon: Star,
              label: "Avg. Rating",
              value: totals.avgRating ? Number(totals.avgRating).toFixed(1) : "—",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3"
            >
              <item.icon className="w-4 h-4 text-[var(--primary)] shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-slate-900 leading-tight">{item.value}</p>
                <p className="text-[11px] text-slate-500">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          <MaterialsFilterSidebar
            current={{
              type: params.type,
              category: params.category,
              subject: params.subject,
              q: params.q,
              tag: params.tag,
              sort: params.sort,
              view: params.view,
              semester: params.semester,
              college: params.college,
            }}
            subjects={subjects.map((subject: any) => ({
              value: subject.slug,
              label: subject.name,
            }))}
          />

          <div>
            <form className="mb-5">
              <input
                type="search"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search materials, subjects, notes..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
              {params.type && <input type="hidden" name="type" value={params.type} />}
              {params.category && <input type="hidden" name="category" value={params.category} />}
              {params.subject && <input type="hidden" name="subject" value={params.subject} />}
              {params.tag && <input type="hidden" name="tag" value={params.tag} />}
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              {params.view && <input type="hidden" name="view" value={params.view} />}
              {params.semester && <input type="hidden" name="semester" value={params.semester} />}
              {params.college && <input type="hidden" name="college" value={params.college} />}
            </form>

            <MaterialsToolbar
              current={{
                type: params.type,
                category: params.category,
                subject: params.subject,
                q: params.q,
                tag: params.tag,
                sort: params.sort,
                view: params.view,
                semester: params.semester,
                college: params.college,
              }}
            />

            {materials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center mt-6">
                <p className="text-slate-500">No materials match your filters.</p>
                <Link href="/materials" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div
                className={
                  view === "list"
                    ? "mt-6 space-y-3"
                    : "mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                }
              >
                {materials.map((material: any) => (
                  <MaterialCard
                    key={String(material._id)}
                    material={material}
                    view={view}
                    bookmarked={bookmarkedIds.has(String(material._id))}
                    loggedIn={Boolean(userId)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1">
                {page > 1 && (
                  <Link href={queryForPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg hover:bg-white">
                    Prev
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => {
                  const n = index + 1;
                  return (
                    <Link
                      key={n}
                      href={queryForPage(n)}
                      className={`min-w-8 h-8 px-2 rounded-lg text-sm font-semibold flex items-center justify-center ${
                        n === page ? "bg-[var(--primary)] text-white" : "text-slate-600 hover:bg-white"
                      }`}
                    >
                      {n}
                    </Link>
                  );
                })}
                {totalPages > 7 && <span className="px-2 text-slate-400">…</span>}
                {page < totalPages && (
                  <Link href={queryForPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg hover:bg-white">
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-semibold text-xs text-slate-600 mb-1.5">Disclaimer</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            The study materials available on GetMaterials are sourced from publicly available online
            resources, contributed by teachers, or shared by students from various colleges and
            educational institutions. We do not claim ownership of any material unless explicitly
            stated. If any college, university, or educational institution believes that certain
            materials should not be displayed on our platform, please{" "}
            <a href="/contact" className="text-[var(--primary)] hover:underline font-medium">
              contact us
            </a>{" "}
            and we will promptly remove or modify the content as requested.
          </p>
        </div>
      </div>
    </main>
  );
}
