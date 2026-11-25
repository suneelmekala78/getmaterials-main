import { unstable_cache } from "next/cache";
import {
  Chapter,
  College,
  Material,
  Subject,
  connectDB,
} from "@/lib/database";
import { ratedAverageExpr } from "@/lib/rating-aggregate";
import { collegePathKey } from "@/lib/college-key";
import { parseList, type QueryParam } from "@/lib/filter-list";

const PUBLISHED = { status: "published", isPublic: true } as const;
const STATS_REVALIDATE = 300;
const FILTERS_REVALIDATE = 300;
const LIST_REVALIDATE = 60;

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

export type MaterialsListParams = {
  type?: QueryParam;
  category?: QueryParam;
  subject?: QueryParam;
  q?: string;
  tag?: string;
  sort?: string;
  page?: string;
  semester?: QueryParam;
  college?: QueryParam;
  chapter?: QueryParam;
  program?: QueryParam;
};

function sortFor(sortKey: string): Record<string, 1 | -1> {
  if (sortKey === "popular") return { views: -1, createdAt: -1 };
  if (sortKey === "downloads") return { downloads: -1, createdAt: -1 };
  if (sortKey === "rating") return { "rating.average": -1, createdAt: -1 };
  return { createdAt: -1 };
}

function serializeMaterial(material: any) {
  const attachment = material.attachments?.[0];
  return {
    _id: String(material._id),
    title: material.title,
    slug: material.slug,
    type: material.type,
    thumbnailUrl: material.thumbnailUrl || null,
    semester: material.semester ?? null,
    views: material.views || 0,
    downloads: material.downloads || 0,
    rating: {
      average: material.rating?.average || 0,
      count: material.rating?.count || 0,
    },
    attachments: attachment
      ? [
          {
            type: attachment.type,
            fileName: attachment.fileName || null,
            fileSize: attachment.fileSize || null,
          },
        ]
      : [],
    subject: material.subject
      ? { name: material.subject.name, slug: material.subject.slug }
      : null,
    uploadedBy: material.uploadedBy
      ? { name: material.uploadedBy.name, role: material.uploadedBy.role }
      : null,
    college: material.college ? { name: material.college.name } : null,
  };
}

export async function getMaterialsHubStats() {
  return unstable_cache(
    async () => {
      await connectDB();
      const [totalMaterials, totalColleges, totalSubjects, aggregates] = await Promise.all([
        Material.countDocuments(PUBLISHED),
        College.countDocuments({}),
        Subject.countDocuments({}),
        Material.aggregate([
          { $match: PUBLISHED },
          {
            $group: {
              _id: null,
              downloads: { $sum: "$downloads" },
              avgRating: ratedAverageExpr,
            },
          },
        ]),
      ]);
      const totals = aggregates[0] || { downloads: 0, avgRating: 0 };
      return {
        totalMaterials,
        totalColleges,
        totalSubjects,
        downloads: totals.downloads || 0,
        avgRating: totals.avgRating || 0,
      };
    },
    ["materials-hub-stats-v1"],
    { revalidate: STATS_REVALIDATE, tags: ["materials-stats"] }
  )();
}

export async function getMaterialsFilterOptions() {
  return unstable_cache(
    async () => {
      await connectDB();
      const [subjects, colleges] = await Promise.all([
        Subject.find({ isActive: true }).select("name slug").sort({ name: 1 }).lean(),
        College.find({ status: "active" }).select("name slug code").sort({ name: 1 }).lean(),
      ]);
      return {
        subjects: subjects.map((subject: any) => ({
          value: String(subject.slug),
          label: String(subject.name),
        })),
        colleges: colleges.map((college: any) => ({
          value: collegePathKey(college),
          label: college.code ? `${college.name} (${college.code})` : String(college.name),
        })),
      };
    },
    ["materials-filter-options-v1"],
    { revalidate: FILTERS_REVALIDATE, tags: ["materials-filters"] }
  )();
}

async function loadChaptersForSubjects(subjectIds: string[]) {
  if (!subjectIds.length) return [] as { value: string; label: string }[];
  const chapters = await Chapter.find({ subject: { $in: subjectIds } })
    .select("title slug")
    .sort({ title: 1 })
    .limit(400)
    .lean();
  const unique = new Map<string, { value: string; label: string }>();
  for (const chapter of chapters as any[]) {
    const value = String(chapter.slug);
    if (!unique.has(value)) {
      unique.set(value, { value, label: String(chapter.title || chapter.slug) });
    }
  }
  return Array.from(unique.values());
}

export async function getMaterialsListing(params: MaterialsListParams) {
  const types = parseList(params.type).filter((item) =>
    typeValues.includes(item as (typeof typeValues)[number])
  );
  const categories = parseList(params.category).filter((item) =>
    categoryValues.includes(item as (typeof categoryValues)[number])
  );
  const semesters = parseList(params.semester)
    .map((item) => Number(item))
    .filter((item) => item >= 1 && item <= 10);
  const programs = parseList(params.program);
  const subjectSlugs = parseList(params.subject).sort();
  const collegeKeys = parseList(params.college)
    .map((item) => item.toLowerCase())
    .sort();
  const chapterSlugs = parseList(params.chapter).sort();
  const q = (params.q || "").trim();
  const tag = (params.tag || "").toLowerCase().trim();
  const sortKey = params.sort || "latest";
  const page = Math.max(1, Number(params.page) || 1);

  const cacheKey = [
    "materials-listing-v1",
    types.join(","),
    categories.join(","),
    semesters.join(","),
    programs.join(","),
    subjectSlugs.join(","),
    collegeKeys.join(","),
    chapterSlugs.join(","),
    q.toLowerCase(),
    tag,
    sortKey,
    String(page),
  ];

  return unstable_cache(
    async () => {
      await connectDB();

      const filter: Record<string, unknown> = { ...PUBLISHED };
      if (types.length) filter.type = { $in: types };
      if (categories.length) filter.materialCategory = { $in: categories };
      if (semesters.length) filter.semester = { $in: semesters };
      if (programs.length) filter.program = { $in: programs };
      if (tag) filter.tags = tag;
      if (q) {
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.title = { $regex: escaped, $options: "i" };
      }

      const [subjectDocs, collegeDocs, chapterDocs] = await Promise.all([
        subjectSlugs.length
          ? Subject.find({ slug: { $in: subjectSlugs } }).select("_id").lean()
          : Promise.resolve([]),
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
          ? Chapter.find({ slug: { $in: chapterSlugs } }).select("_id").lean()
          : Promise.resolve([]),
      ]);

      const subjectIds = (subjectDocs as any[]).map((item) => String(item._id));
      if (subjectDocs.length) {
        filter.subject = { $in: (subjectDocs as any[]).map((item) => item._id) };
      }
      if (chapterDocs.length) {
        filter.chapter = { $in: (chapterDocs as any[]).map((item) => item._id) };
      }
      if (collegeDocs.length) {
        const collegeIds = (collegeDocs as any[]).map((item) => item._id);
        filter.$or = [{ college: { $in: collegeIds } }, { colleges: { $in: collegeIds } }];
      }

      const PAGE_SIZE = 18;
      const skip = (page - 1) * PAGE_SIZE;
      const sort = sortFor(sortKey);

      const [totalMatching, materials, chapters] = await Promise.all([
        Material.countDocuments(filter),
        Material.find(filter)
          .select(
            "title slug type thumbnailUrl semester views downloads rating attachments subject uploadedBy college"
          )
          .populate("subject", "name slug")
          .populate("uploadedBy", "name role")
          .populate("college", "name")
          .sort(sort)
          .skip(skip)
          .limit(PAGE_SIZE)
          .lean(),
        loadChaptersForSubjects(subjectIds),
      ]);

      return {
        totalMatching,
        page,
        pageSize: PAGE_SIZE,
        materials: (materials as any[]).map(serializeMaterial),
        chapters,
      };
    },
    cacheKey,
    { revalidate: LIST_REVALIDATE, tags: ["materials-listing"] }
  )();
}
