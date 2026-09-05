import { connectDB, College, Material, User } from "@/lib/database";
import Link from "next/link";
import type { Metadata } from "next";
import { GraduationCap, Search } from "lucide-react";
import { TeacherCard } from "@/components/teachers/TeacherCard";
import { findCollegeByKey, teachersAtCollegeFilter } from "@/lib/college-key";
import { listingMetadata } from "@/lib/seo";
import { ratedAverageExpr } from "@/lib/rating-aggregate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = listingMetadata({
  title: "Teachers — Learn from Verified Educators",
  description:
    "Discover teachers on GetMaterials and explore the notes, lectures, and quizzes they share with students.",
  path: "/teachers",
  keywords: ["teachers", "educators", "college faculty", "GetMaterials teachers"],
});

interface Props {
  searchParams: Promise<{ q?: string; college?: string }>;
}

export default async function TeachersPage({ searchParams }: Props) {
  const params = await searchParams;
  await connectDB();

  const q = params.q?.trim() || "";
  const collegeKey = params.college?.trim() || "";
  const filter: Record<string, unknown> = { role: "teacher", status: "active" };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { qualifications: { $regex: q, $options: "i" } },
      { bio: { $regex: q, $options: "i" } },
    ];
  }
  if (collegeKey) {
    const college = await findCollegeByKey(collegeKey, { status: "active" });
    if (college) {
      const collegeMatch = teachersAtCollegeFilter((college as any)._id);
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, collegeMatch];
        delete filter.$or;
      } else {
        Object.assign(filter, collegeMatch);
      }
    } else filter._id = null;
  }

  const [teachers, colleges] = await Promise.all([
    User.find(filter)
      .select("name slug avatar banner bannerPos bio qualifications college")
      .populate("college", "name code slug")
      .sort({ name: 1 })
      .limit(200)
      .lean(),
    College.find({ status: "active" }).select("name code slug").sort({ name: 1 }).lean(),
  ]);

  const ids = teachers.map((teacher: any) => teacher._id);
  const counts = ids.length
    ? await Material.aggregate([
        {
          $match: {
            uploadedBy: { $in: ids },
            status: "published",
            isPublic: true,
          },
        },
        {
          $group: {
            _id: "$uploadedBy",
            materials: { $sum: 1 },
            avgRating: ratedAverageExpr,
          },
        },
      ])
    : [];
  const countMap = new Map(counts.map((row: any) => [String(row._id), row]));

  return (
    <main className="bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-400 mb-4">
          <Link href="/" className="hover:text-[var(--primary)]">
            Home
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-600">Teachers</span>
        </p>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Teachers</h1>
        </div>
        <p className="text-slate-500 mb-6">Find educators and explore the materials they share.</p>

        <form action="/teachers" className="flex flex-col sm:flex-row gap-3 mb-8">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search teachers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-violet-500"
            />
          </label>
          <select
            name="college"
            defaultValue={collegeKey}
            className="sm:w-64 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
          >
            <option value="">All colleges</option>
            {colleges.map((college: any) => (
              <option key={String(college._id)} value={college.slug || college.code}>
                {college.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90"
          >
            Search
          </button>
        </form>

        {teachers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500">
            No teachers match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher: any) => {
              const stats = countMap.get(String(teacher._id));
              return (
                <TeacherCard
                  key={String(teacher._id)}
                  teacher={{
                    ...teacher,
                    materials: stats?.materials || 0,
                    avgRating: stats?.avgRating || 0,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
