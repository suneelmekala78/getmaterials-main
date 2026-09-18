import { connectDB, Follow, Material, Quiz, Review, User } from "@/lib/database";
import { uniqueUserSlug } from "@/lib/user-slug";
import { ratedAverageExpr } from "@/lib/rating-aggregate";

const PROFILE_SELECT =
  "name slug avatar banner avatarPos bannerPos role status bio qualifications skills interests social college emailVerified phoneVerified";

export function looksLikeObjectId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value);
}

export async function loadPublicProfile(slugOrId: string) {
  await connectDB();
  const key = String(slugOrId || "").trim();
  if (!key) return null;

  const normalized = key.toLowerCase();
  let user: any = await User.findOne({ slug: normalized })
    .select(PROFILE_SELECT)
    .populate("college", "name")
    .lean();

  let requestedViaAlias = false;
  if (!user) {
    user = await User.findOne({ previousSlugs: normalized })
      .select(PROFILE_SELECT)
      .populate("college", "name")
      .lean();
    requestedViaAlias = Boolean(user);
  }

  const requestedViaId = !user && looksLikeObjectId(key);
  if (!user && requestedViaId) {
    user = await User.findById(key)
      .select(PROFILE_SELECT)
      .populate("college", "name")
      .lean();
  }
  if (!user || user.status === "suspended") return null;

  if (!user.slug) {
    const slug = await uniqueUserSlug(async (candidate) => {
      const taken = await User.findOne({
        $or: [{ slug: candidate }, { previousSlugs: candidate }],
        _id: { $ne: user._id },
      })
        .select("_id")
        .lean();
      return Boolean(taken);
    }, user.name);
    await User.updateOne({ _id: user._id }, { slug });
    user.slug = slug;
  }

  const published = { uploadedBy: user._id, status: "published", isPublic: true };
  const [materials, stats, quizzes] = await Promise.all([
    Material.find(published)
      .populate("subject", "name slug")
      .populate("uploadedBy", "name avatar slug role")
      .sort({ createdAt: -1 })
      .limit(80)
      .lean(),
    Material.aggregate([
      { $match: published },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          downloads: { $sum: "$downloads" },
          views: { $sum: "$views" },
          avgRating: ratedAverageExpr,
        },
      },
    ]),
    Quiz.find({ createdBy: user._id, isActive: true })
      .populate("subject", "name slug")
      .populate("chapter", "title slug")
      .sort({ createdAt: -1 })
      .limit(80)
      .lean(),
  ]);

  const materialIds = materials.map((item: any) => item._id);
  const reviews = materialIds.length
    ? await Review.find({ material: { $in: materialIds }, isApproved: true })
        .populate("user", "name avatar role")
        .populate("material", "title slug")
        .sort({ createdAt: -1 })
        .limit(80)
        .lean()
    : [];

  const [followersCount, followingCount] = await Promise.all([
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
  ]);

  return {
    user,
    materials,
    quizzes,
    reviews,
    stats: {
      ...(stats[0] || { count: 0, downloads: 0, views: 0, avgRating: 0 }),
      followersCount,
      followingCount,
    },
    canonicalSlug: user.slug as string,
    requestedViaId,
    requestedViaAlias,
  };
}

export async function resolveUserSlug(userId: string) {
  await connectDB();
  const user: any = await User.findById(userId).select("name slug").lean();
  if (!user) return null;
  if (user.slug) return user.slug as string;
  const slug = await uniqueUserSlug(async (candidate) => {
    const taken = await User.findOne({
      $or: [{ slug: candidate }, { previousSlugs: candidate }],
      _id: { $ne: user._id },
    })
      .select("_id")
      .lean();
    return Boolean(taken);
  }, user.name);
  await User.updateOne({ _id: user._id }, { slug });
  return slug;
}
