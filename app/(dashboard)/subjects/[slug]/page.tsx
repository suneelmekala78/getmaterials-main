import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Layers } from "lucide-react";
import { connectDB, Subject, Chapter, Material, College, User } from "@/lib/database";
import { auth } from "@/lib/auth";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { SubjectLogo, type SubjectCardData } from "@/components/subjects/SubjectCard";
import { categoryLabel } from "@/components/subjects/query";
import MaterialsFilterSidebar from "@/components/materials/MaterialsFilterSidebar";
import MaterialsToolbar from "@/components/materials/MaterialsToolbar";
import MaterialCard from "@/components/materials/MaterialCard";
import { materialsHref, type MaterialsQuery } from "@/components/materials/query";
import { parseList, type QueryParam } from "@/lib/filter-list";
import { collegePathKey } from "@/lib/college-key";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    type?: QueryParam;
    category?: QueryParam;
    q?: string;
    sort?: string;
    view?: string;
    page?: string;
    semester?: QueryParam;
    college?: QueryParam;
    chapter?: QueryParam;
    program?: QueryParam;
  }>;
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const subject = await Subject.findOne({ slug, isActive: true })
    .select("name description icon category")
    .lean<any>();
  if (!subject) return { title: "Subject Not Found" };

  const description =
    subject.description ||
    `Browse free ${subject.name} study materials, notes, and PDFs on GetMaterials.`;
  const url = absoluteUrl(`/subjects/${slug}`);
  const ogImage = subject.icon
    ? { url: absoluteUrl(subject.icon), width: 512, height: 512, alt: subject.name }
    : DEFAULT_OG_IMAGE;

  return {
    title: `${subject.name} — Free Study Materials`,
    description,
    keywords: [
      subject.name,
      `${subject.name} notes`,
      `${subject.name} study materials`,
      categoryLabel(subject.category || "general"),
      "GetMaterials",
      "free notes",
    ],
    openGraph: {
      title: `${subject.name} — Free Study Materials | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${subject.name} — Free Study Materials`,
      description,
      images: [ogImage.url],
    },
    alternates: { canonical: url },
  };
}

export default async function SubjectDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const queryParams = await searchParams;
  await connectDB();
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const subject = await Subject.findOne({ slug, isActive: true }).lean<any>();
  if (!subject) notFound();

  const basePath = `/subjects/${slug}`;
  const current: MaterialsQuery = {
    type: queryParams.type,
    category: queryParams.category,
    q: queryParams.q,
    sort: queryParams.sort,
    view: queryParams.view,
    page: queryParams.page,
    semester: queryParams.semester,
    college: queryParams.college,
    chapter: queryParams.chapter,
    program: queryParams.program,
  };

  const filter: any = {
    status: "published",
    isPublic: true,
    subject: subject._id,
  };

  const types = parseList(queryParams.type).filter((item) => typeValues.includes(item as any));
  const categories = parseList(queryParams.category).filter((item) =>
    categoryValues.includes(item as any)
  );
  const semesters = parseList(queryParams.semester)
    .map((item) => Number(item))
    .filter((item) => item >= 1 && item <= 10);
  const programs = parseList(queryParams.program);
  if (types.length) filter.type = { $in: types };
  if (categories.length) filter.materialCategory = { $in: categories };
  if (semesters.length) filter.semester = { $in: semesters };
  if (programs.length) filter.program = { $in: programs };
  if (queryParams.q) filter.title = { $regex: queryParams.q, $options: "i" };

  const collegeKeys = parseList(queryParams.college).map((item) => item.toLowerCase());
  const chapterSlugs = parseList(queryParams.chapter);

  const [collegeDocs, chapterDocs] = await Promise.all([
    collegeKeys.length
      ? College.find({
          $or: [
            { slug: { $in: collegeKeys } },
            { code: { $in: collegeKeys.map((item) => item.toUpperCase()) } },
          ],
        })
          .select("_id")
          .lean()
      : Promise.resolve([]),
    chapterSlugs.length
      ? Chapter.find({ subject: subject._id, slug: { $in: chapterSlugs } }).select("_id").lean()
      : Promise.resolve([]),
  ]);

  if (chapterDocs.length) filter.chapter = { $in: chapterDocs.map((item: any) => item._id) };
  if (collegeDocs.length) {
    const collegeIds = collegeDocs.map((item: any) => item._id);
    filter.$or = [{ college: { $in: collegeIds } }, { colleges: { $in: collegeIds } }];
  }

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

  const [
    totalMatching,
    materials,
    chapters,
    collegeOptions,
    bookmarkUser,
    totalForSubject,
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
    Chapter.find({ subject: subject._id }).select("title slug").sort({ order: 1, title: 1 }).lean(),
    College.find({ status: "active" }).select("name slug code").sort({ name: 1 }).lean(),
    userId ? User.findById(userId).select("bookmarks").lean() : null,
    Material.countDocuments({ status: "published", isPublic: true, subject: subject._id }),
  ]);

  const bookmarkedIds = new Set(
    ((bookmarkUser as any)?.bookmarks || []).map((id: any) => String(id))
  );
  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
  const subjectCard: SubjectCardData = {
    id: String(subject._id),
    name: subject.name,
    slug: subject.slug,
    category: subject.category || "general",
    materialsCount: totalForSubject,
    icon: subject.icon || null,
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${subject.name} study materials`,
    description:
      subject.description ||
      `Free ${subject.name} notes and study materials on GetMaterials`,
    url: absoluteUrl(`/subjects/${slug}`),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    numberOfItems: totalForSubject,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <p className="text-sm text-slate-400">
        <Link href="/" className="hover:text-[var(--primary)]">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <Link href="/subjects" className="hover:text-[var(--primary)]">
          Subjects
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-600">{subject.name}</span>
      </p>

      <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <SubjectLogo subject={subjectCard} size="xl" />
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)] border border-violet-100">
              {categoryLabel(subject.category || "general")}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {subject.name}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
              {subject.description ||
                `Free notes, PDFs, and study resources for ${subject.name} — curated for students.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 border border-slate-100 shadow-sm">
                <Layers className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-semibold text-slate-900">
                  {chapters.length} chapter{chapters.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 border border-slate-100 shadow-sm">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">
                  {totalForSubject} material{totalForSubject === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 items-start">
        <MaterialsFilterSidebar
          current={current}
          basePath={basePath}
          hideSubjects
          subjects={[]}
          chapters={chapters.map((c: any) => ({ value: c.slug, label: c.title }))}
          colleges={collegeOptions.map((c: any) => ({
            value: collegePathKey(c),
            label: c.code ? `${c.name} (${c.code})` : c.name,
          }))}
        />

        <div>
          <MaterialsToolbar current={current} basePath={basePath} />
          {materials.length === 0 ? (
            <div className="mt-5 bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No materials match your filters.</p>
              <Link href={basePath} className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
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
                      {prev && n - prev > 1 ? <span className="px-2 text-slate-400">…</span> : null}
                      <Link
                        href={materialsHref(current, { page: String(n) }, basePath)}
                        className={`min-w-8 h-8 px-2 rounded-full text-sm font-semibold flex items-center justify-center ${
                          n === page ? "bg-[var(--primary)] text-white" : "text-slate-600 hover:bg-white"
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
    </div>
  );
}
