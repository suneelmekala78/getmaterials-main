import { connectDB, College, Material, User } from "@/lib/database";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Download,
  Heart,
  Search,
  Star,
  Users,
} from "lucide-react";
import CollegesFilterSidebar from "@/components/colleges/CollegesFilterSidebar";
import CollegesToolbar from "@/components/colleges/CollegesToolbar";
import CollegeCard, { type CollegeCardData } from "@/components/colleges/CollegeCard";
import { collegesHref, formatCount, timeAgo, type CollegesQuery } from "@/components/colleges/query";
import { collegeLogoSrc, collegePlace } from "@/lib/college-media";
import { DEFAULT_COLLEGE_IMAGE, listingMetadata } from "@/lib/seo";
import { parseList, type QueryParam } from "@/lib/filter-list";
import { HiddenListInputs } from "@/components/filters/HiddenListInputs";
import { ratedAverageExpr } from "@/lib/rating-aggregate";

export const metadata: Metadata = listingMetadata({
  title: "Colleges in India — Free Campus Study Materials",
  description:
    "Browse colleges on GetMaterials and open free notes, PDFs, and lectures shared for each campus across India.",
  path: "/colleges",
  keywords: [
    "college study materials",
    "engineering college notes",
    "campus notes India",
    "B.Tech materials",
    "GetMaterials colleges",
  ],
  image: DEFAULT_COLLEGE_IMAGE,
  imageAlt: "GetMaterials colleges",
});

const PAGE_SIZE = 9;

interface Props {
  searchParams: Promise<{
    q?: string;
    location?: QueryParam;
    branch?: QueryParam;
    program?: QueryParam;
    sort?: string;
    view?: string;
    tab?: string;
    page?: string;
  }>;
}

export default async function CollegesPage({ searchParams }: Props) {
  const params = await searchParams;
  await connectDB();
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  const currentUser = userId ? await User.findById(userId).select("college").lean() : null;
  const myCollegeId = (currentUser as any)?.college ? String((currentUser as any).college) : "";

  const published = { status: "published", isPublic: true };
  const [
    allColleges,
    materialStats,
    branchStats,
    studentCount,
    platformMaterials,
    platformDownloads,
    avgRatingAgg,
    topContributorsAgg,
  ] = await Promise.all([
    College.find({ status: "active" }).sort({ name: 1 }).lean(),
    Material.aggregate([
      { $match: published },
      {
        $addFields: {
          collegeIds: {
            $setUnion: [
              { $cond: [{ $ifNull: ["$college", false] }, ["$college"], []] },
              { $ifNull: ["$colleges", []] },
            ],
          },
        },
      },
      { $unwind: "$collegeIds" },
      {
        $group: {
          _id: "$collegeIds",
          materials: { $sum: 1 },
          downloads: { $sum: "$downloads" },
          avgRating: ratedAverageExpr,
        },
      },
    ]),
    Material.aggregate([
      {
        $match: {
          ...published,
          $or: [
            { branch: { $exists: true, $nin: [null, ""] } },
            { branches: { $exists: true, $ne: [] } },
          ],
        },
      },
      {
        $addFields: {
          collegeIds: {
            $setUnion: [
              { $cond: [{ $ifNull: ["$college", false] }, ["$college"], []] },
              { $ifNull: ["$colleges", []] },
            ],
          },
          branchList: {
            $cond: [
              { $gt: [{ $size: { $ifNull: ["$branches", []] } }, 0] },
              "$branches",
              {
                $filter: {
                  input: { $split: [{ $ifNull: ["$branch", ""] }, ","] },
                  as: "b",
                  cond: { $gt: [{ $strLenCP: { $trim: { input: "$$b" } } }, 0] },
                },
              },
            ],
          },
        },
      },
      { $unwind: "$collegeIds" },
      { $unwind: "$branchList" },
      {
        $group: {
          _id: {
            college: "$collegeIds",
            branch: { $toUpper: { $trim: { input: "$branchList" } } },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    User.countDocuments({ college: { $exists: true, $ne: null } }),
    Material.countDocuments(published),
    Material.aggregate([{ $match: published }, { $group: { _id: null, downloads: { $sum: "$downloads" } } }]),
    Material.aggregate([
      { $match: { ...published, "rating.count": { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$rating.average" } } },
    ]),
    Material.aggregate([
      { $match: published },
      { $group: { _id: "$uploadedBy", materials: { $sum: 1 }, downloads: { $sum: "$downloads" } } },
      { $sort: { materials: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const statsMap = new Map(materialStats.map((row: any) => [String(row._id), row]));
  const branchMap = new Map<string, { name: string; count: number }[]>();
  branchStats.forEach((row: any) => {
    const collegeId = String(row._id.college);
    const list = branchMap.get(collegeId) || [];
    list.push({ name: String(row._id.branch).toUpperCase(), count: row.count });
    branchMap.set(collegeId, list);
  });

  const contributorIds = topContributorsAgg.map((row: any) => row._id).filter(Boolean);
  const contributorUsers = contributorIds.length
    ? await User.find({ _id: { $in: contributorIds } })
        .select("name avatar college")
        .populate("college", "name")
        .lean()
    : [];
  const userMap = new Map(contributorUsers.map((user: any) => [String(user._id), user]));

  const locations = Array.from(
    new Set(allColleges.map((college: any) => college.location).filter(Boolean))
  ).sort() as string[];

  const branches = Array.from(
    new Set(
      allColleges.flatMap((college: any) => (college.branches || []).map((item: any) => item.name)).filter(Boolean)
    )
  ).sort() as string[];

  const programsMap = new Map<string, string>();
  allColleges.forEach((college: any) => {
    (college.programs || []).forEach((program: any) => {
      if (program.key) programsMap.set(program.key, program.label || program.key);
    });
  });
  const programs = Array.from(programsMap.entries()).map(([value, label]) => ({ value, label }));

  let filtered = allColleges.filter((college: any) => {
    if (params.tab === "mine" && myCollegeId && String(college._id) !== myCollegeId) return false;
    const locations = parseList(params.location);
    if (locations.length && !locations.includes(college.location)) return false;
    const programs = parseList(params.program);
    if (
      programs.length &&
      !(college.programs || []).some((item: any) => programs.includes(item.key))
    ) {
      return false;
    }
    const branches = parseList(params.branch);
    if (branches.length) {
      const hasBranch = (college.branches || []).some((item: any) =>
        branches.some((branch) => String(item.name).toUpperCase() === branch.toUpperCase())
      );
      if (!hasBranch) return false;
    }
    if (params.q) {
      const q = params.q.toLowerCase();
      const haystack = `${college.name} ${college.code || ""} ${college.slug || ""} ${college.location || ""} ${college.city || ""} ${college.state || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sortKey = params.sort || "popular";
  filtered = [...filtered].sort((a: any, b: any) => {
    const aStats = statsMap.get(String(a._id));
    const bStats = statsMap.get(String(b._id));
    if (sortKey === "name") return a.name.localeCompare(b.name);
    if (sortKey === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return (bStats?.materials || 0) - (aStats?.materials || 0);
  });

  const page = Math.max(1, Number(params.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cards: CollegeCardData[] = paged.map((college: any) => {
    const stats = statsMap.get(String(college._id));
    const materialBranches = (branchMap.get(String(college._id)) || []).sort((a, b) => b.count - a.count);
    const fallbackBranches = (college.branches || []).map((item: any) => ({ name: item.name, count: 0 }));
    return {
      id: String(college._id),
      name: college.name,
      slug: college.slug,
      code: college.code,
      logo: college.logo,
      banner: college.banner,
      location: college.location,
      city: college.city,
      state: college.state,
      materials: stats?.materials || 0,
      avgRating: stats?.avgRating || 0,
      branches: materialBranches.length ? materialBranches : fallbackBranches,
    };
  });

  const recentColleges = [...allColleges]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const current: CollegesQuery = {
    q: params.q,
    location: params.location,
    branch: params.branch,
    program: params.program,
    sort: params.sort,
    view: params.view,
    tab: params.tab,
  };
  const view = params.view === "list" ? "list" : "grid";
  const platformAvg = avgRatingAgg[0]?.avg ? Number(avgRatingAgg[0].avg).toFixed(1) : "—";

  const queryForPage = (nextPage: number) =>
    collegesHref(current, { page: nextPage > 1 ? String(nextPage) : undefined });

  return (
    <main className="bg-[#fafafa] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-sm text-slate-400 mb-4">
          <Link href="/" className="hover:text-[var(--primary)]">
            Home
          </Link>
          <span className="mx-1.5">›</span>
          <span className="text-slate-600">Colleges</span>
        </p>

        <section className="grid lg:grid-cols-[1fr_280px] gap-6 items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900">Colleges</h1>
            </div>
            <p className="text-slate-500 mb-5">Explore study materials shared by students and colleges.</p>
            <form action="/colleges" className="flex flex-col sm:flex-row gap-3">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={params.q || ""}
                  placeholder="Search your college..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-violet-500"
                />
              </label>
              <HiddenListInputs name="branch" value={params.branch} />
              <HiddenListInputs name="location" value={params.location} />
              <HiddenListInputs name="program" value={params.program} />
              {params.sort && <input type="hidden" name="sort" value={params.sort} />}
              {params.view && <input type="hidden" name="view" value={params.view} />}
              {params.tab && <input type="hidden" name="tab" value={params.tab} />}
            </form>
          </div>
          <div className="hidden lg:flex h-40 rounded-3xl bg-gradient-to-br from-violet-100 via-indigo-50 to-white border border-violet-100 items-center justify-center relative overflow-hidden">
            <Building2 className="w-24 h-24 text-violet-300" />
            <div className="absolute bottom-4 right-6 w-16 h-10 rounded-xl bg-white/80 border border-violet-100" />
            <div className="absolute top-6 left-8 w-10 h-10 rounded-full bg-white/70" />
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[
            { icon: Building2, tint: "bg-blue-50 text-blue-600", value: formatCount(allColleges.length), label: "Colleges" },
            { icon: Users, tint: "bg-emerald-50 text-emerald-600", value: `${formatCount(studentCount)}+`, label: "Active Students" },
            { icon: BookOpen, tint: "bg-orange-50 text-orange-600", value: `${formatCount(platformMaterials)}+`, label: "Materials Shared" },
            {
              icon: Download,
              tint: "bg-violet-50 text-violet-600",
              value: formatCount(platformDownloads[0]?.downloads || 0),
              label: "Downloads",
            },
            { icon: Star, tint: "bg-pink-50 text-pink-600", value: platformAvg, label: "Avg. Rating" },
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
          <CollegesFilterSidebar current={current} locations={locations} branches={branches} programs={programs} />

          <div>
            <CollegesToolbar current={current} loggedIn={Boolean(userId)} />
            {cards.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <p className="text-slate-500">No colleges match your filters.</p>
                <Link href="/colleges" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
                  Clear filters
                </Link>
              </div>
            ) : (
              <div className={view === "list" ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                {cards.map((college) => (
                  <CollegeCard key={college.id} college={college} view={view} />
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
                {page < totalPages && (
                  <Link href={queryForPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg hover:bg-white">
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24">
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">Top Contributors</h3>
              </div>
              <div className="space-y-3">
                {topContributorsAgg.length === 0 && <p className="text-xs text-slate-400">No contributors yet.</p>}
                {topContributorsAgg.map((row: any) => {
                  const user = userMap.get(String(row._id));
                  if (!user) return null;
                  return (
                    <div key={String(row._id)} className="flex items-center gap-3">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.college?.name || "GetMaterials"}</p>
                      </div>
                      <span className="text-[11px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                        {formatCount(row.materials)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-bold text-slate-900 text-sm mb-4">Recently Joined Colleges</h3>
              <div className="space-y-3">
                {recentColleges.map((college: any) => (
                  <Link
                    key={String(college._id)}
                    href={`/colleges/${encodeURIComponent(college.slug || college.code || college._id)}`}
                    className="flex items-center gap-3 hover:opacity-80"
                  >
                    <div className="w-9 h-9 rounded-lg bg-violet-50 overflow-hidden flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={collegeLogoSrc(college.logo)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{college.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{collegePlace(college) || college.code}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(college.createdAt)}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/contact"
              className="block rounded-2xl bg-[var(--primary)] text-white p-5 hover:opacity-95 transition-opacity"
            >
              <Heart className="w-5 h-5 mb-3" />
              <p className="font-bold leading-snug">Add your college & contribute</p>
              <p className="text-sm text-white/80 mt-1">Help your college community grow</p>
              <ArrowRight className="w-4 h-4 mt-3" />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
