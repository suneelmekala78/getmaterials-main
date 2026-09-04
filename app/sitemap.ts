import type { MetadataRoute } from "next";
import { connectDB, College, Material, Subject, User } from "@/lib/database";
import { SITE_URL } from "@/lib/seo";

function entry(
  path: string,
  lastModified: Date,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: path.startsWith("http") ? path : `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", now, "weekly", 1),
    entry("/materials", now, "daily", 0.9),
    entry("/subjects", now, "daily", 0.8),
    entry("/colleges", now, "weekly", 0.8),
    entry("/quizzes", now, "weekly", 0.6),
    entry("/about", now, "monthly", 0.7),
    entry("/how-to-use", now, "monthly", 0.7),
    entry("/contact", now, "monthly", 0.5),
    entry("/feedback", now, "monthly", 0.4),
    entry("/privacy", now, "yearly", 0.3),
    entry("/terms", now, "yearly", 0.3),
  ];

  try {
    await connectDB();
    const [materials, subjects, users, colleges] = await Promise.all([
      Material.find({ status: "published", isPublic: true })
        .select("slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5000)
        .lean(),
      Subject.find({ isActive: true }).select("slug updatedAt").lean(),
      User.find({
        slug: { $exists: true, $nin: [null, ""] },
        status: { $ne: "suspended" },
      })
        .select("slug updatedAt")
        .limit(2000)
        .lean(),
      College.find({ status: "active", code: { $exists: true, $nin: [null, ""] } })
        .select("code updatedAt")
        .lean(),
    ]);

    return [
      ...staticPages,
      ...subjects.map((subject: any) =>
        entry(
          `/subjects/${subject.slug}`,
          subject.updatedAt || now,
          "weekly",
          0.7,
        ),
      ),
      ...materials
        .filter((material: any) => material.slug)
        .map((material: any) =>
          entry(
            `/materials/${material.slug}`,
            material.updatedAt || now,
            "weekly",
            0.8,
          ),
        ),
      ...colleges.map((college: any) =>
        entry(
          `/materials?college=${encodeURIComponent(college.code)}`,
          college.updatedAt || now,
          "weekly",
          0.6,
        ),
      ),
      ...users.map((user: any) =>
        entry(`/users/${user.slug}`, user.updatedAt || now, "weekly", 0.5),
      ),
    ];
  } catch (error) {
    console.error("[sitemap] falling back to static URLs", error);
    return staticPages;
  }
}
