import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { Follow, User } from "@/lib/database";
import {
  defaultAvatarSrc,
  defaultBannerSrc,
  FittedPhoto,
} from "@/components/profile/FittedPhoto";
import { FollowButton } from "@/components/profile/FollowButton";
import { FollowStatButton } from "@/components/profile/FollowList";
import { ProfileLibrary } from "@/components/profile/ProfileLibrary";
import { loadPublicProfile } from "@/lib/public-profile";
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from "@/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
}

function formatCount(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function roleLabel(role?: string) {
  if (role === "teacher") return "Teacher";
  if (role === "admin") return "Admin";
  if (role === "college_admin") return "College admin";
  return "Student";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const profile = await loadPublicProfile(id);
  if (!profile) return { title: "Profile - GetMaterials" };
  const slug = profile.canonicalSlug || id;
  const title = `${profile.user.name} · ${roleLabel(profile.user.role)}`;
  const description =
    profile.user.bio ||
    `${profile.user.name} shares free study materials on GetMaterials.`;
  const url = absoluteUrl(`/users/${slug}`);
  const image = profile.user.avatar || DEFAULT_OG_IMAGE.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "profile",
      images: [{ url: image, alt: profile.user.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await loadPublicProfile(id);
  if (!profile) notFound();
  if (
    (profile.requestedViaId || profile.requestedViaAlias) &&
    profile.canonicalSlug &&
    profile.canonicalSlug !== id
  ) {
    redirect(`/users/${profile.canonicalSlug}`);
  }

  const session = await auth();
  const currentUserId = (session?.user as any)?.id || null;
  const isOwn = currentUserId && String(currentUserId) === String(profile.user._id);
  const bookmarks = isOwn
    ? (((await User.findById(currentUserId).select("bookmarks").lean()) as any)
        ?.bookmarks || [])
    : [];
  const bookmarkSet = new Set(bookmarks.map((item: any) => String(item)));

  const { user, materials, quizzes, reviews, stats } = profile;
  const collegeName = user.college?.name;
  const avatarSrc = user.avatar || defaultAvatarSrc(user.role);
  const bannerSrc = user.banner || defaultBannerSrc();
  const isFollowing = Boolean(
    currentUserId &&
      !isOwn &&
      (await Follow.exists({ follower: currentUserId, following: user._id })),
  );

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <section className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <FittedPhoto
          src={bannerSrc}
          pos={user.banner ? user.bannerPos : undefined}
          className="h-36 sm:h-44 w-full bg-violet-100"
          alt=""
        />

        <div className="px-6 sm:px-8 pb-8">
          <div className="relative w-24 h-24 -mt-12">
            <FittedPhoto
              src={avatarSrc}
              pos={user.avatarPos}
              className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white"
              alt={user.name}
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                {user.name}
                {user.emailVerified ? (
                  <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : null}
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold capitalize">
                  {roleLabel(user.role)}
                </span>
                {collegeName ? (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {collegeName}
                  </span>
                ) : null}
              </p>
            </div>
            {isOwn ? (
              <Link
                href="/settings"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold shrink-0"
              >
                Edit profile
              </Link>
            ) : (
              <FollowButton
                userId={String(user._id)}
                initialFollowing={isFollowing}
                loggedIn={Boolean(currentUserId)}
                callbackUrl={`/users/${user.slug || user._id}`}
              />
            )}
          </div>

          {user.bio ? (
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600 max-w-3xl">
              {user.bio}
            </p>
          ) : (
            <p className="mt-5 text-sm text-slate-400">
              {isOwn
                ? "Add a short bio in settings so others know what you share."
                : "This contributor has not added a bio yet."}
            </p>
          )}
          {user.qualifications ? (
            <p className="mt-2 text-sm text-slate-500">
              Qualifications: {user.qualifications}
            </p>
          ) : null}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Materials", value: formatCount(stats.count || 0) },
              { label: "Downloads", value: formatCount(stats.downloads || 0) },
              { label: "Views", value: formatCount(stats.views || 0) },
              {
                label: "Rating",
                value: stats.avgRating ? Number(stats.avgRating).toFixed(1) : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <p className="text-lg font-extrabold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
            <FollowStatButton
              userId={String(user._id)}
              kind="followers"
              count={stats.followersCount || 0}
              label="Followers"
              isOwner={Boolean(isOwn)}
            />
            <FollowStatButton
              userId={String(user._id)}
              kind="following"
              count={stats.followingCount || 0}
              label="Following"
              isOwner={Boolean(isOwn)}
            />
          </div>
        </div>
      </section>

      <ProfileLibrary
        materials={JSON.parse(JSON.stringify(materials))}
        quizzes={(quizzes || []).map((quiz: any) => ({
          id: String(quiz._id),
          title: quiz.title,
          description: quiz.description || "",
          subject: quiz.subject?.name || "",
          chapter: quiz.chapter?.title || "",
          questions: quiz.questions?.length || 0,
          duration: quiz.duration,
          passingScore: quiz.passingScore,
          attempts: quiz.attempts || 0,
        }))}
        reviews={(reviews || []).map((review: any) => ({
          id: String(review._id),
          rating: review.rating,
          comment: review.comment,
          createdAt: String(review.createdAt),
          user: {
            name: review.user?.name || "Student",
            avatar: review.user?.avatar || "",
            role: review.user?.role || "student",
          },
          material: review.material
            ? { title: review.material.title, slug: review.material.slug }
            : null,
        }))}
        bookmarkSet={Array.from(bookmarkSet) as string[]}
        loggedIn={Boolean(currentUserId)}
      />
    </main>
  );
}
