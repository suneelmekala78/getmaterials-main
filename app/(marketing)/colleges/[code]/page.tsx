import { connectDB, Material, User, materialCollegeFilter } from "@/lib/database";
import { collegeHref, collegePathKey, ensureCollegeSlug, findCollegeByKey } from "@/lib/college-key";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Download,
  GraduationCap,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import MaterialCard from "@/components/materials/MaterialCard";
import { TeacherCard } from "@/components/teachers/TeacherCard";
import { formatCount } from "@/components/colleges/query";
import { listingMetadata } from "@/lib/seo";
import { ratedAverageExpr } from "@/lib/rating-aggregate";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ code: string }>;
}

async function loadCollege(code: string) {
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

  const [stats, materials, teachers, studentCount] = await Promise.all([
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
    Material.find(published)
      .populate("subject", "name slug")
      .populate("uploadedBy", "name slug avatar role")
      .populate("college", "name")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    User.find({ role: "teacher", status: "active", college: (college as any)._id })
      .select("name slug avatar banner bannerPos bio qualifications")
      .sort({ name: 1 })
      .limit(12)
      .lean(),
    User.countDocuments({ college: (college as any)._id, status: { $ne: "suspended" } }),
  ]);

  return {
    college,
    stats: stats[0] || { materials: 0, downloads: 0, avgRating: 0 },
    materials,
    teachers,
    studentCount,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const data = await loadCollege(code);
  if (!data) return { title: "College - GetMaterials" };
  const { college, stats } = data;
  return listingMetadata({
    title: `${college.name} — Free Campus Study Materials`,
    description:
      college.description ||
      `Browse ${stats.materials || 0} free notes and lectures shared for ${college.name}.`,
    path: collegeHref(college),
    keywords: [college.name, college.code, college.slug, "college notes", "campus materials"].filter(Boolean) as string[],
  });
}

export default async function CollegeDetailsPage({ params }: Props) {
  const { code } = await params;
  const data = await loadCollege(code);
  if (!data) notFound();

  const { college, stats, materials, teachers, studentCount } = data;
  const materialsHref = `/materials?college=${encodeURIComponent(collegePathKey(college))}`;
  const programs = college.programs || [];
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
                <img src={college.logo} alt={`${college.name} logo`} className="max-w-[88%] max-h-[88%] object-contain" />
              ) : (
                <span className="text-lg font-extrabold text-violet-700">{(college.code || college.name).slice(0, 3).toUpperCase()}</span>
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
            <Link
              href={materialsHref}
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 shrink-0"
            >
              Browse materials
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { icon: BookOpen, value: formatCount(stats.materials || 0), label: "Materials" },
              { icon: Download, value: formatCount(stats.downloads || 0), label: "Downloads" },
              { icon: GraduationCap, value: formatCount(teachers.length), label: "Teachers" },
              { icon: Users, value: formatCount(studentCount), label: "Students" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
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

        {(programs.length > 0 || branches.length > 0) && (
          <section className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-8 mb-8">
            {programs.length > 0 && (
              <div className="mb-5">
                <h2 className="text-sm font-bold text-slate-900 mb-3">Programs</h2>
                <div className="flex flex-wrap gap-2">
                  {programs.map((program: any) => (
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Latest materials</h2>
            <Link href={materialsHref} className="text-sm font-semibold text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>
          {materials.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-500">
              No materials have been shared for this college yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {materials.map((material: any) => (
                <MaterialCard
                  key={String(material._id)}
                  material={material}
                  view="grid"
                  bookmarked={false}
                  loggedIn={false}
                />
              ))}
            </div>
          )}
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
                  teacher={{ ...teacher, college: { name: college.name } }}
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
