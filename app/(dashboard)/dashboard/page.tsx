import { auth } from "@/lib/auth";
import { connectDB, Material, Subject, User, Quiz } from "@/lib/database";
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
} from "lucide-react";
import Link from "next/link";
import { PollWidget } from "@/components/PollWidget";
import { resolveThumbnailSrc } from "@/components/profile/FittedPhoto";
import { PracticeStreakCard } from "@/components/practice/PracticeStreakCard";

export const metadata = {
  title: "Dashboard - GetMaterials",
};

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
  ] = await Promise.all([
    Subject.countDocuments({ isActive: true }),
    Material.countDocuments({ status: "published", isPublic: true }),
    Quiz.countDocuments({ isActive: true }),
    userId ? Material.countDocuments({ uploadedBy: userId }) : Promise.resolve(0),
    Material.find({ status: "published", isPublic: true })
      .populate("subject", "name slug")
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    userId
      ? User.findById(userId).select("bookmarks name studyProfile").lean()
      : null,
  ]);

  const study = (currentUser as any)?.studyProfile;
  const subjectIds = study?.subjects || [];
  const collegeId = study?.college;
  const forYouFilter: Record<string, unknown> = { status: "published", isPublic: true };
  if (collegeId) forYouFilter.$or = [{ college: collegeId }, { colleges: collegeId }];
  if (subjectIds.length) forYouFilter.subject = { $in: subjectIds };
  if (study?.semester) forYouFilter.semester = study.semester;
  const [forYouMaterials, forYouQuizzes] = userId && (collegeId || subjectIds.length)
    ? await Promise.all([
        Material.find(forYouFilter)
          .select("title slug type thumbnailUrl subject")
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
  const firstName = user?.name?.split(" ")[0] || "there";

  const quickLinks = [
    {
      href: "/subjects",
      label: "Subjects",
      desc: "Browse by topic",
      icon: BookOpen,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      href: "/quizzes",
      label: "Quizzes",
      desc: `${quizzesCount} available`,
      icon: ClipboardList,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      href: "/polls",
      label: "Polls",
      desc: "Share your take",
      icon: BarChart3,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      href: "/upload",
      label: "Upload",
      desc: "Share materials",
      icon: CloudUpload,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      href: "/my-materials",
      label: "My uploads",
      desc: `${myUploadsCount} files`,
      icon: Upload,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      href: "/bookmarks",
      label: "Bookmarks",
      desc: `${bookmarksCount} saved`,
      icon: Bookmark,
      tone: "bg-indigo-50 text-indigo-600",
    },
  ];

  const stats = [
    { href: "/subjects", icon: BookOpen, label: "Subjects", value: subjectsCount, tone: "text-violet-600 bg-violet-50" },
    { href: "/subjects", icon: FileText, label: "Materials", value: materialsCount, tone: "text-blue-600 bg-blue-50" },
    { href: "/quizzes", icon: ClipboardList, label: "Quizzes", value: quizzesCount, tone: "text-sky-600 bg-sky-50" },
    { href: "/bookmarks", icon: Bookmark, label: "Bookmarks", value: bookmarksCount, tone: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 0% 0%, rgba(177,0,255,0.12), transparent 55%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(59,130,246,0.1), transparent 50%)",
          }}
        />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-[var(--primary)] mb-1">Your learning hub</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-slate-500 mt-2 text-[15px] leading-relaxed">
              Jump into subjects, practice with quizzes, or upload notes for others — everything in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/subjects"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-opacity"
            >
              Browse subjects
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-800 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
            >
              <CloudUpload className="w-4 h-4" />
              Upload material
            </Link>
          </div>
        </div>
      </section>

      {userId ? <PracticeStreakCard /> : null}

      {user?.role !== "teacher" && study && !study.completed && !study.dismissed && (
        <Link href="/welcome" className="block rounded-2xl bg-violet-600 text-white p-5">
          <p className="font-bold">Finish your study profile</p>
          <p className="text-sm text-white/80 mt-1">College, course, and subjects personalize what you see.</p>
        </Link>
      )}

      {(forYouMaterials.length > 0 || forYouQuizzes.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">For your course</h2>
              <p className="text-sm text-slate-500">Matched to your college, semester, and subjects.</p>
            </div>
            <Link href="/timetable" className="text-sm font-semibold text-violet-700">Timetable</Link>
          </div>
          {forYouMaterials.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {forYouMaterials.map((item: any) => (
                <Link key={String(item._id)} href={`/materials/${item.slug}`} className="rounded-2xl border border-slate-100 bg-white p-4 hover:border-violet-200">
                  <p className="text-xs font-semibold text-violet-700">{item.subject?.name || "Material"}</p>
                  <p className="font-bold text-slate-900 mt-1 line-clamp-2">{item.title}</p>
                </Link>
              ))}
            </div>
          )}
          {forYouQuizzes.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {forYouQuizzes.map((quiz: any) => (
                <Link key={String(quiz._id)} href={`/quizzes/${quiz.slug || quiz._id}`} className="min-w-[200px] rounded-2xl border border-slate-100 bg-white p-4">
                  <p className="font-bold text-slate-900 line-clamp-2">{quiz.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{quiz.duration} min</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-2xl border border-slate-100 bg-white p-4 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.tone}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-[var(--primary)] transition-colors">
              {item.label}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.tone}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </Link>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recently added</h2>
            <Link href="/subjects" className="text-sm text-[var(--primary)] font-semibold hover:underline inline-flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentMaterials.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentMaterials.map((material: any) => (
                <Link
                  key={material._id.toString()}
                  href={`/materials/${material.slug}`}
                  className="group flex gap-3 bg-white rounded-2xl border border-slate-100 p-3 hover:border-slate-200 hover:shadow-sm transition-all"
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
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
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
          <h2 className="text-lg font-bold text-slate-900">Quick poll</h2>
          <PollWidget />
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
            <p className="text-sm font-semibold text-slate-900 mb-1">Tip</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Uploads go live right away. Add a clear title and thumbnail so students can find your notes faster.
            </p>
            <Link href="/my-materials" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[var(--primary)] hover:underline">
              Manage my uploads <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
