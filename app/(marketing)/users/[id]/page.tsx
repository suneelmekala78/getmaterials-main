import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  GraduationCap,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  Settings2,
  CloudUpload,
  Bookmark,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { auth } from "@/lib/auth";
import { Follow, User } from "@/lib/database";
import {
  defaultAvatarSrc,
  defaultBannerSrc,
  FittedPhoto,
} from "@/components/profile/FittedPhoto";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { FollowButton } from "@/components/profile/FollowButton";
import { FollowStatButton } from "@/components/profile/FollowList";
import { ProfileLibrary } from "@/components/profile/ProfileLibrary";
import { PracticeStreakCard } from "@/components/practice/PracticeStreakCard";
import { loadPublicProfile } from "@/lib/public-profile";
import { SITE_NAME, absoluteUrl, ogImages } from "@/lib/seo";

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

function socialEntries(social?: Record<string, string | undefined> | null) {
  if (!social) return [];
  const map = [
    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
    { key: "github", label: "GitHub", icon: Github },
    { key: "twitter", label: "X", icon: FaXTwitter },
    { key: "instagram", label: "Instagram", icon: Instagram },
    { key: "youtube", label: "YouTube", icon: Youtube },
    { key: "website", label: "Website", icon: Globe },
  ] as const;
  return map
    .map((item) => ({
      ...item,
      href: String(social[item.key] || "").trim(),
    }))
    .filter((item) => item.href.startsWith("http"));
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
  const image = ogImages(
    profile.user.banner || profile.user.avatar,
    profile.user.name,
    absoluteUrl("/images/default-banner.png"),
  );
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
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image.url],
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
  const links = socialEntries(user.social);

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
      {isOwn ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Your public profile</p>
            <p className="text-xs text-slate-500 mt-0.5">
              This is what others see. Edit details anytime in settings.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              Upload
            </Link>
            <Link
              href="/bookmarks"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-violet-300 hover:text-violet-700 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Edit profile
            </Link>
          </div>
        </div>
      ) : null}

      <section className="bg-white rounded-[1.75rem] border border-slate-100 overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div className="relative">
          <FittedPhoto
            src={bannerSrc}
            pos={user.banner ? user.bannerPos : undefined}
            className="h-40 sm:h-52 w-full bg-slate-100"
            alt=""
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.18) 100%)",
            }}
          />
        </div>

        <div className="px-5 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 sm:-mt-14">
            <div className="relative w-[5.5rem] h-[5.5rem] sm:w-28 sm:h-28 shrink-0">
              <FittedPhoto
                src={avatarSrc}
                pos={user.avatarPos}
                className="w-full h-full rounded-2xl border-4 border-white shadow-lg bg-white"
                alt={user.name}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:pb-1">
              {isOwn ? (
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Settings2 className="w-4 h-4" />
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
          </div>

          <div className="mt-4 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              <span className="truncate">{user.name}</span>
              <VerifiedBadge role={user.role} className="w-5 h-5 shrink-0" />
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold capitalize">
                {roleLabel(user.role)}
              </span>
              {user.emailVerified ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold">
                  Email verified
                </span>
              ) : null}
              {user.phoneVerified ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold">
                  Phone verified
                </span>
              ) : null}
              {collegeName ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  {collegeName}
                </span>
              ) : null}
            </div>
          </div>

          {user.bio ? (
            <p className="mt-5 text-[15px] leading-relaxed text-slate-600 max-w-3xl">
              {user.bio}
            </p>
          ) : (
            <p className="mt-5 text-sm text-slate-400">
              {isOwn ? (
                <>
                  No bio yet.{" "}
                  <Link href="/settings" className="font-semibold text-violet-700 hover:underline">
                    Add one in settings
                  </Link>{" "}
                  so others know what you share.
                </>
              ) : (
                "This contributor has not added a bio yet."
              )}
            </p>
          )}

          {isOwn ? (
            <div className="mt-5 max-w-lg">
              <PracticeStreakCard />
            </div>
          ) : null}

          {user.qualifications ? (
            <p className="mt-3 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">Qualifications:</span>{" "}
              {user.qualifications}
            </p>
          ) : null}

          {(user.skills?.length || user.interests?.length) ? (
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {user.skills?.length ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg bg-white border border-violet-100 text-violet-700 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {user.interests?.length ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Interests
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest: string) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {links.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {links.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700 transition"
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  <ArrowUpRight className="w-3 h-3 opacity-50" />
                </a>
              ))}
            </div>
          ) : null}

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
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
                className="rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white px-4 py-3.5"
              >
                <p className="text-lg font-extrabold text-slate-900 tabular-nums">{item.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
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
