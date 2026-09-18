import {
  connectDB,
  Material,
  User,
  Subject,
  Chapter,
  materialCollegeFilter,
} from "@/lib/database";
import {
  collegeHref,
  collegePathKey,
  ensureCollegeSlug,
  findCollegeByKey,
  teachersAtCollegeFilter,
} from "@/lib/college-key";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  BookOpen,
  Building2,
  Download,
  GraduationCap,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import MaterialCard from "@/components/materials/MaterialCard";
import MaterialsFilterSidebar from "@/components/materials/MaterialsFilterSidebar";
import MaterialsToolbar from "@/components/materials/MaterialsToolbar";
import { materialsHref, type MaterialsQuery } from "@/components/materials/query";
import { TeacherCard } from "@/components/teachers/TeacherCard";
import { formatCount } from "@/components/colleges/query";
import { listingMetadata } from "@/lib/seo";
import { ratedAverageExpr } from "@/lib/rating-aggregate";
import { parseList, type QueryParam } from "@/lib/filter-list";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
  params: Promise<{ code: string }>;
  searchParams: Promise<{
    type?: QueryParam;
    category?: QueryParam;
    subject?: QueryParam;
    q?: string;
    sort?: string;
    view?: string;
    page?: string;
    semester?: QueryParam;
    chapter?: QueryParam;
    program?: QueryParam;
  }>;
}

async function loadCollegeMeta(code: string) {
  await connectDB();
  const collegeDoc = await findCollegeByKey(code, { status: "active" });
  if (!collegeDoc) return null;
  const slug = await ensureCollegeSlug(collegeDoc as any);
  const college = (await collegeDoc.toObject?.()) || (collegeDoc as any);
  college.slug = slug;

  const published = {
    status: "published",
    isPublic: true,
    ...materialCollegeFilter((college as any)._id),
  };

  const [stats, teachers, studentCount] = await Promise.all([
    Material.aggregate([
      { $match: published },
      {
        $group: {
          _id: null,
          materials: { $sum: 1 },
          downloads: { $sum: "$downloads" },
          avgRating: ratedAverageExpr,
        },
      },
    ]),
    User.find({ role: "teacher", status: "active", ...teachersAtCollegeFilter((college as any)._id) })
      .select("name slug avatar banner bannerPos bio qualifications role")
      .sort({ name: 1 })
      .limit(12)
      .lean(),
    User.countDocuments({ college: (college as any)._id, status: { $ne: "suspended" } }),
  ]);

  return {
    college,
    stats: stats[0] || { materials: 0, downloads: 0, avgRating: 0 },
    teachers,
    studentCount,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const data = await loadCollegeMeta(code);
  if (!data) return { title: "College - GetMaterials" };
  const { college, stats } = data;
  return listingMetadata({
    title: `${college.name} — Free Campus Study Materials`,
    description:
      college.description ||
      `Browse ${stats.materials || 0} free notes and lectures shared for ${college.name}.`,
    path: collegeHref(college),
    keywords: [college.name, college.code, college.slug, "college notes", "campus materials"].filter(
      Boolean
    ) as string[],
  });
}

export default async function CollegeDetailsPage({ params, searchParams }: Props) {
  const { code } = await params;
  const queryParams = await searchParams;
  const data = await loadCollegeMeta(code);
  if (!data) notFound();

  const { college, stats, teachers, studentCount } = data;
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const basePath = collegeHref(college);
  const current: MaterialsQuery = {
    type: queryParams.type,
    category: queryParams.category,
    subject: queryParams.subject,
    q: queryParams.q,
    sort: queryParams.sort,
    view: queryParams.view,
    page: queryParams.page,
    semester: queryParams.semester,
    chapter: queryParams.chapter,
    program: queryParams.program,
  };

  const filter: any = {
    status: "published",
    isPublic: true,
    ...materialCollegeFilter((college as any)._id),
  };

  const types = parseList(queryParams.type).filter((item) => typeValues.includes(item as any));
  const categories = parseList(queryParams.category).filter((item) =>
    categoryValues.includes(item as any)
  );
  const semesters = parseList(queryParams.semester)
    .map((item) => Number(item))
    .filter((item) => item >= 1 && item <= 10);
  const programKeys = parseList(queryParams.program);
  if (types.length) filter.type = { $in: types };
  if (categories.length) filter.materialCategory = { $in: categories };
  if (semesters.length) filter.semester = { $in: semesters };
  if (programKeys.length) filter.program = { $in: programKeys };
  if (queryParams.q) filter.title = { $regex: queryParams.q, $options: "i" };

  const subjectSlugs = parseList(queryParams.subject);
  const chapterSlugs = parseList(queryParams.chapter);

  const [subjectDocs, chapterDocs] = await Promise.all([
    subjectSlugs.length
      ? Subject.find({ slug: { $in: subjectSlugs } }).select("_id").lean()
      : Promise.resolve([]),
    chapterSlugs.length
      ? Chapter.find({ slug: { $in: chapterSlugs } }).select("_id").lean()
      : Promise.resolve([]),
  ]);

  if (subjectDocs.length) filter.subject = { $in: subjectDocs.map((item: any) => item._id) };
  if (chapterDocs.length) filter.chapter = { $in: chapterDocs.map((item: any) => item._id) };

  const sortKey = queryParams.sort || "latest";
  const sort: Record<string, 1 | -1> =
    sortKey === "popular"
      ? { views: -1, createdAt: -1 }
      : sortKey === "downloads"
        ? { downloads: -1, createdAt: -1 }
        : sortKey === "rating"
          ? { "rating.average": -1, createdAt: -1 }
          : { createdAt: -1 };

  const page = Math.max(1, Number(queryParams.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const view = queryParams.view === "list" ? "list" : "grid";

  const [totalMatching, materials, subjects, chapterOptions, bookmarkUser] = await Promise.all([
    Material.countDocuments(filter),
    Material.find(filter)
      .populate("subject", "name slug")
      .populate("uploadedBy", "name role")
      .populate("college", "name")
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Subject.find({ isActive: true }).select("name slug").sort({ name: 1 }).lean(),
    Chapter.find(subjectDocs.length ? { subject: { $in: subjectDocs.map((item: any) => item._id) } } : {})
      .select("title slug")
      .sort({ title: 1 })
      .limit(400)
      .lean(),
    userId ? User.findById(userId).select("bookmarks").lean() : null,
  ]);

  const bookmarkedIds = new Set(
    ((bookmarkUser as any)?.bookmarks || []).map((id: any) => String(id))
  );
  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
  const collegePrograms = college.programs || [];
  const branches = college.branches || [];

  return (
    <main className="bg-[#fafafa] min-h-screen">
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-indigo-600 to-violet-700">
        {college.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={college.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Building2 className="absolute right-8 bottom-8 w-20 h-20 text-white/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-14 pb-16">
        <p className="text-sm text-white/80 mb-4 relative z-10">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <span className="mx-1.5">›</span>
          <Link href="/colleges" className="hover:underline">
            Colleges
          </Link>
          <span className="mx-1.5">›</span>
          <span>{college.name}</span>
        </p>

        <section className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-100 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {college.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={college.logo}
                  alt={`${college.name} logo`}
                  className="max-w-[88%] max-h-[88%] object-contain"
                />
              ) : (
                <span className="text-lg font-extrabold text-violet-700">
                  {(college.code || college.name).slice(0, 3).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{college.name}</h1>
              <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                {college.code ? <span className="font-semibold text-violet-700">{college.code}</span> : null}
                {college.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {college.location}
                  </span>
                )}
              </p>
              {college.description && (
                <p className="text-slate-600 mt-3 leading-relaxed">{college.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: BookOpen, value: formatCount(stats.materials || 0), label: "Materials" },
              { icon: Download, value: formatCount(stats.downloads || 0), label: "Downloads" },
              { icon: GraduationCap, value: formatCount(teachers.length), label: "Teachers" },
              { icon: Users, value: formatCount(studentCount), label: "Students" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{item.value}</p>
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {(collegePrograms.length > 0 || branches.length > 0) && (
          <section className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-8 mb-8">
            {collegePrograms.length > 0 && (
              <div className="mb-5">
                <h2 className="text-sm font-bold text-slate-900 mb-3">Programs</h2>
                <div className="flex flex-wrap gap-2">
                  {collegePrograms.map((program: any) => (
                    <span
                      key={program.key}
                      className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold"
                    >
                      {program.label || program.key}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {branches.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3">Branches</h2>
                <div className="flex flex-wrap gap-2">
                  {branches.map((branch: any, index: number) => (
                    <span
                      key={`${branch.name}-${index}`}
                      className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 text-xs font-semibold"
                    >
                      {branch.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-extrabold text-slate-900 mb-4">Materials</h2>
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
            <MaterialsFilterSidebar
              current={current}
              basePath={basePath}
              hideColleges
              subjects={subjects.map((subject: any) => ({
                value: subject.slug,
                label: subject.name,
              }))}
              chapters={Array.from(
                new Map(
                  chapterOptions.map((chapter: any) => [
                    String(chapter.slug),
                    { value: String(chapter.slug), label: String(chapter.title || chapter.slug) },
                  ])
                ).values()
              )}
              colleges={[]}
            />

            <div>
              <MaterialsToolbar current={current} basePath={basePath} />
              {materials.length === 0 ? (
                <div className="mt-5 bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No materials match your filters.</p>
                  <Link
                    href={basePath}
                    className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block"
                  >
                    Clear filters
                  </Link>
                </div>
              ) : (
                <div
                  className={
                    view === "grid"
                      ? "mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                      : "mt-5 space-y-3"
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
                    <Link
                      href={materialsHref(current, { page: String(page - 1) }, basePath)}
                      className="w-8 h-8 rounded-full text-sm flex items-center justify-center hover:bg-white"
                    >
                      ‹
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                    .map((n, index, arr) => {
                      const prev = arr[index - 1];
                      return (
                        <span key={n} className="contents">
                          {prev && n - prev > 1 ? (
                            <span className="px-2 text-slate-400">…</span>
                          ) : null}
                          <Link
                            href={materialsHref(current, { page: String(n) }, basePath)}
                            className={`min-w-8 h-8 px-2 rounded-full text-sm font-semibold flex items-center justify-center ${
                              n === page
                                ? "bg-[var(--primary)] text-white"
                                : "text-slate-600 hover:bg-white"
                            }`}
                          >
                            {n}
                          </Link>
                        </span>
                      );
                    })}
                  {page < totalPages && (
                    <Link
                      href={materialsHref(current, { page: String(page + 1) }, basePath)}
                      className="w-8 h-8 rounded-full text-sm flex items-center justify-center hover:bg-white"
                    >
                      ›
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Teachers</h2>
            <Link
              href={`/teachers?college=${encodeURIComponent(collegePathKey(college))}`}
              className="text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          {teachers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">
              No teachers from this college yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher: any) => (
                <TeacherCard
                  key={String(teacher._id)}
                  teacher={{ ...teacher, college: { name: college.name }, role: teacher.role }}
                />
              ))}
            </div>
          )}
        </section>

        {stats.avgRating > 0 && (
          <p className="mt-8 text-sm text-slate-500 inline-flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            Average material rating {Number(stats.avgRating).toFixed(1)}
          </p>
        )}
      </div>
    </main>
  );
}
