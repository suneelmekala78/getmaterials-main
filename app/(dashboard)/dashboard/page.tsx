import { auth } from "@/lib/auth";
import { connectDB, Material, Subject } from "@getmaterials/database";
import { BookOpen, FileText, Video, Bookmark, Clock } from "lucide-react";
import Link from "next/link";
import { PollWidget } from "@/components/PollWidget";

export const metadata = {
  title: "Dashboard - GetMaterials",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  await connectDB();

  const [subjectsCount, materialsCount, recentMaterials] = await Promise.all([
    Subject.countDocuments({ isActive: true }),
    Material.countDocuments({ status: "published", isPublic: true }),
    Material.find({ status: "published", isPublic: true })
      .populate("subject", "name slug")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="bg-[var(--primary)] rounded-2xl p-8 text-white">
        <h1 className="text-2xl font-extrabold mb-2">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-white/80 max-w-lg">
          Ready to continue learning? Browse subjects or pick up where you left off.
        </p>
        <div className="flex gap-3 mt-6">
          <Link href="/subjects" className="px-5 py-2.5 bg-white text-[var(--primary)] font-semibold rounded-lg text-sm hover:-translate-y-0.5 transition-all">
            Browse Subjects
          </Link>
          <Link href="/bookmarks" className="px-5 py-2.5 bg-white/20 text-white font-semibold rounded-lg text-sm hover:bg-white/30 transition-all">
            My Bookmarks
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: "Subjects", value: subjectsCount },
          { icon: FileText, label: "Materials", value: materialsCount },
          { icon: Bookmark, label: "Bookmarks", value: 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-[rgba(177,0,255,0.08)] flex items-center justify-center mb-3">
              <stat.icon className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <p className="text-2xl font-extrabold">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recently Added</h2>
          <Link href="/subjects" className="text-sm text-[var(--primary)] font-semibold hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentMaterials.map((material: any) => (
            <Link
              key={material._id.toString()}
              href={`/subjects/${(material.subject as any)?.slug}`}
              className="group bg-white rounded-2xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  {material.type === "video" ? (
                    <Video className="w-5 h-5 text-[var(--primary)]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[var(--primary)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold group-hover:text-[var(--primary)] truncate transition-colors">
                    {material.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(material.subject as any)?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(material.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {recentMaterials.length === 0 && (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No materials yet</h3>
            <p className="text-gray-500 text-sm">Check back soon for new study materials.</p>
          </div>
        )}
        </div>

        {/* Poll Widget */}
        <div className="lg:col-span-1">
          <PollWidget />
        </div>
      </div>
    </div>
  );
}
