import { auth } from "@/lib/auth";
import {
  connectDB,
  Material,
  Subject,
  User,
  Quiz,
  Article,
  CommunityThread,
} from "@/lib/database";
import {
  BookOpen,
  FileText,
  Video,
  Bookmark,
  Clock,
  Upload,
  ClipboardList,
  BarChart3,
  ArrowRight,
  CloudUpload,
  Sparkles,
  Settings2,
  CalendarDays,
  UserRound,
  Newspaper,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";
import { PollWidget } from "@/components/PollWidget";
import {
  defaultAvatarSrc,
  resolveThumbnailSrc,
} from "@/components/profile/FittedPhoto";
import { PracticeStreakCard } from "@/components/practice/PracticeStreakCard";

export const metadata = {
  title: "Dashboard - GetMaterials",
};

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;
  const userId = user?.id;

  await connectDB();

  const [
    subjectsCount,
    materialsCount,
    quizzesCount,
    myUploadsCount,
    recentMaterials,
    currentUser,
    latestArticles,
    recentThreads,
  ] = await Promise.all([
    Subject.countDocuments({ isActive: true }),
    Material.countDocuments({ status: "published", isPublic: true }),
    Quiz.countDocuments({ isActive: true }),
    userId ? Material.countDocuments({ uploadedBy: userId }) : Promise.resolve(0),
    Material.find({ status: "published", isPublic: true })
      .populate("subject", "name slug")
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    userId
      ? User.findById(userId)
          .select("bookmarks name avatar role studyProfile slug")
          .populate("studyProfile.college", "name code")
          .lean()
      : null,
    Article.find({ status: "published" })
      .select("title slug excerpt publishedAt")
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean(),
    CommunityThread.find()
      .populate("topic", "key label")
      .select("title topic replyCount lastReplyAt createdAt")
      .sort({ lastReplyAt: -1, createdAt: -1 })
      .limit(4)
      .lean(),
  ]);

  const study = (currentUser as any)?.studyProfile;
  const subjectIds = study?.subjects || [];
  const collegeId = study?.college?._id || study?.college;
  const collegeName = study?.college?.name || "";
  const forYouFilter: Record<string, unknown> = { status: "published", isPublic: true };
  if (collegeId) forYouFilter.$or = [{ college: collegeId }, { colleges: collegeId }];
  if (subjectIds.length) forYouFilter.subject = { $in: subjectIds };
  if (study?.semester) forYouFilter.semester = study.semester;
  const [forYouMaterials, forYouQuizzes] = userId && (collegeId || subjectIds.length)
    ? await Promise.all([
        Material.find(forYouFilter)
          .select("title slug type thumbnailUrl subject createdAt")
          .populate("subject", "name")
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
        Quiz.find({
          isActive: true,
          ...(subjectIds.length ? { subject: { $in: subjectIds } } : {}),
        })
          .select("title slug thumbnailUrl duration")
          .sort({ createdAt: -1 })
          .limit(4)
          .lean(),
      ])
    : [[], []];

  const bookmarksCount = (currentUser as any)?.bookmarks?.length || 0;
  const firstName = (currentUser as any)?.name?.split(" ")[0] || user?.name?.split(" ")[0] || "there";
  const avatarSrc = (currentUser as any)?.avatar || user?.image || defaultAvatarSrc(user?.role);
  const profileHref = `/users/${(currentUser as any)?.slug || userId || ""}`;
  const hour = new Date().getHours();
  const needsOnboarding =
    user?.role !== "teacher" && study && !study.completed && !study.dismissed;
  const hasPersonalized = forYouMaterials.length > 0 || forYouQuizzes.length > 0;

  const primaryActions = [
    {
      href: "/subjects",
      label: "Browse subjects",
      desc: `${subjectsCount} topics ready`,
      icon: BookOpen,
    },
    {
      href: "/upload",
      label: "Upload notes",
      desc: "Help classmates",
      icon: CloudUpload,
    },
    {
      href: "/quizzes",
      label: "Practice quizzes",
      desc: `${quizzesCount} live`,
      icon: ClipboardList,
    },
    {
      href: "/practice",
      label: "Coding practice",
      desc: "Problems & contests",
      icon: Sparkles,
    },
  ];

  const libraryLinks = [
    { href: "/bookmarks", label: "Bookmarks", value: bookmarksCount, icon: Bookmark },
    { href: "/my-materials", label: "My uploads", value: myUploadsCount, icon: Upload },
    { href: "/articles", label: "Articles", value: latestArticles.length, icon: Newspaper },
    { href: "/community", label: "Community", value: "Ask", icon: MessagesSquare },
    { href: "/polls", label: "Polls", value: "Vote", icon: BarChart3 },
    { href: "/timetable", label: "Timetable", value: "Plan", icon: CalendarDays },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 0% 0%, rgba(177,0,255,0.10), transparent 55%), radial-gradient(ellipse 55% 70% at 100% 20%, rgba(14,165,233,0.08), transparent 50%), linear-gradient(180deg, #fafafa 0%, #ffffff 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230f172a' fill-opacity='0.03'%3E%3Cpath d='M0 39h40v1H0zM39 0v40h1V0z'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <Link
                href={profileHref}
                className="relative shrink-0 rounded-2xl ring-2 ring-white shadow-md overflow-hidden w-14 h-14 sm:w-16 sm:h-16 bg-slate-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
              </Link>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500 uppercase">
                  {greetingForHour(hour)}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 truncate">
                  {firstName}
                </h1>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-xl">
                  {collegeName
                    ? `Studying at ${collegeName}${study?.semester ? ` · Sem ${study.semester}` : ""}. Pick up where you left off or jump into something new.`
                    : "Your study hub — subjects, quizzes, uploads, and practice in one place."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={profileHref}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700 transition-colors"
                  >
                    <UserRound className="w-3.5 h-3.5" />
                    View profile
                  </Link>
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-violet-300 hover:text-violet-700 transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                href={
                  study?.completed || (study?.subjects || []).length
                    ? "/my-semester"
                    : "/welcome?next=/my-semester"
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-sm shadow-violet-500/20"
              >
                {study?.completed || (study?.subjects || []).length
                  ? "My Semester"
                  : "Set up semester"}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
              >
                <CloudUpload className="w-4 h-4" />
                Upload
              </Link>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Subjects", value: subjectsCount, href: "/subjects" },
              { label: "Materials", value: materialsCount, href: "/subjects" },
              { label: "Quizzes", value: quizzesCount, href: "/quizzes" },
              { label: "Saved", value: bookmarksCount, href: "/bookmarks" },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 hover:border-violet-200 hover:bg-white transition-colors"
              >
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{stat.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {needsOnboarding ? (
        <Link
          href="/welcome?next=/my-semester"
          className="group flex items-center justify-between gap-4 rounded-2xl bg-slate-900 text-white px-5 py-4 sm:px-6 hover:bg-slate-800 transition-colors"
        >
          <div>
            <p className="font-bold">Finish your study profile</p>
            <p className="text-sm text-white/70 mt-0.5">
              College, course, and subjects unlock My Semester — notes, papers, quizzes, and discussions.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold shrink-0">
            Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      ) : study?.completed || (study?.subjects || []).length ? (
        <Link
          href="/my-semester"
          className="group flex items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-violet-50/70 px-5 py-4 sm:px-6 hover:bg-violet-50 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
              My Semester
            </p>
            <p className="font-bold text-slate-900 mt-0.5">
              {[
                study?.program ? String(study.program).toUpperCase() : "",
                study?.branch || "",
                study?.year ? `Year ${study.year}` : "",
                study?.semester ? `Semester ${study.semester}` : "",
              ]
                .filter(Boolean)
                .join(" · ") || "Your academic workspace"}
            </p>
            <p className="text-sm text-slate-600 mt-0.5">
              {(study?.subjects || []).length
                ? `${(study.subjects as any[]).length} subjects · notes, papers, quizzes, discussions`
                : "Open your semester hub"}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 shrink-0">
            Open <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      ) : null}

      {userId ? (
        <div className="max-w-xl">
          <PracticeStreakCard />
        </div>
      ) : null}

      {/* Primary actions */}
      <section>
        <div className="flex items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Start here</h2>
            <p className="text-sm text-slate-500">Four clear ways to make progress today.</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {primaryActions.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-500/5 transition-all"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="w-11 h-11 rounded-xl bg-violet-50 text-[var(--primary)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-[var(--primary)] transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              <ArrowRight className="absolute right-4 top-5 w-4 h-4 text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Personalized rail */}
      {hasPersonalized ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">For your course</h2>
              <p className="text-sm text-slate-500">
                Matched to your college, semester, and subjects.
              </p>
            </div>
            <Link href="/timetable" className="text-sm font-semibold text-[var(--primary)] hover:underline">
              Timetable
            </Link>
          </div>
          {forYouMaterials.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {forYouMaterials.map((item: any) => (
                <Link
                  key={String(item._id)}
                  href={`/materials/${item.slug}`}
                  className="group flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 hover:border-violet-200 hover:shadow-sm transition-all"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveThumbnailSrc(item.thumbnailUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 py-0.5">
                    <p className="text-[11px] font-semibold text-violet-700 truncate">
                      {item.subject?.name || "Material"}
                    </p>
                    <p className="font-bold text-slate-900 mt-0.5 line-clamp-2 text-sm group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
          {forYouQuizzes.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
              {forYouQuizzes.map((quiz: any) => (
                <Link
                  key={String(quiz._id)}
                  href={`/quizzes/${quiz.slug || quiz._id}`}
                  className="min-w-[200px] rounded-2xl border border-slate-100 bg-white p-4 hover:border-violet-200 transition-colors"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">Quiz</p>
                  <p className="font-bold text-slate-900 line-clamp-2 mt-1">{quiz.title}</p>
                  <p className="text-xs text-slate-500 mt-2">{quiz.duration} min</p>
                </Link>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Library shortcuts + recent */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Recently added</h2>
              <p className="text-sm text-slate-500">Fresh notes and files from the community.</p>
            </div>
            <Link
              href="/subjects"
              className="text-sm text-[var(--primary)] font-semibold hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentMaterials.map((material: any) => (
                <Link
                  key={material._id.toString()}
                  href={`/materials/${material.slug}`}
                  className="group flex gap-3 bg-white rounded-2xl border border-slate-100 p-3 hover:border-violet-200 hover:shadow-sm transition-all"
                >
                  <div className="relative w-24 h-[4.5rem] rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveThumbnailSrc(material.thumbnailUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {material.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <Video className="w-5 h-5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[var(--primary)] line-clamp-2 transition-colors">
                      {material.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="truncate">{(material.subject as any)?.name}</span>
                      {material.uploadedBy?.role === "teacher" ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold uppercase rounded-md border border-blue-100">
                          Teacher
                        </span>
                      ) : material.uploadedBy?.role === "student" ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase rounded-md border border-emerald-100">
                          Student
                        </span>
                      ) : null}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(material.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No materials yet</h3>
              <p className="text-slate-500 text-sm mb-4">Be the first to share something useful.</p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                <CloudUpload className="w-4 h-4" />
                Upload material
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-3">Your library</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {libraryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-slate-100 bg-white p-3.5 hover:border-violet-200 transition-colors"
                >
                  <item.icon className="w-4 h-4 text-violet-600 mb-2" />
                  <p className="text-sm font-bold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">{item.value}</p>
                </Link>
              ))}
            </div>
          </div>

          {(latestArticles as any[]).length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-slate-900">Latest articles</h2>
                <Link href="/articles" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                  View all
                </Link>
              </div>
              <ul className="space-y-2">
                {(latestArticles as any[]).map((a) => (
                  <li key={String(a._id)}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="block rounded-xl border border-slate-100 bg-white px-3.5 py-3 hover:border-violet-200 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{a.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {(recentThreads as any[]).length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold text-slate-900">From Community</h2>
                <Link href="/community" className="text-xs font-semibold text-[var(--primary)] hover:underline">
                  Open
                </Link>
              </div>
              <ul className="space-y-2">
                {(recentThreads as any[]).map((t) => (
                  <li key={String(t._id)}>
                    <Link
                      href={`/community/thread/${t._id}`}
                      className="block rounded-xl border border-slate-100 bg-white px-3.5 py-3 hover:border-violet-200 transition-colors"
                    >
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{t.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {(t.topic as any)?.label || "Topic"} · {t.replyCount || 0} replies
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-3">Quick poll</h2>
            <PollWidget />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-violet-600" />
              <p className="text-sm font-semibold text-slate-900">Upload tip</p>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Clear titles and thumbnails help students find your notes faster. Drafts stay private until you publish.
            </p>
            <Link
              href="/my-materials"
              className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[var(--primary)] hover:underline"
            >
              Manage uploads <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
