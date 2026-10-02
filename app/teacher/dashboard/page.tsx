import { auth } from "@/lib/auth";
import { connectDB, Material } from "@/lib/database";
import { FileText, Video, Eye, Download, TrendingUp, Upload } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Teacher Dashboard - GetMaterials",
};

export default async function TeacherDashboardPage() {
  const session = await auth();
  const user = session?.user as any;

  await connectDB();

  // Use string id — avoid a second mongoose instance from `import mongoose from "mongoose"`
  const userId = user.id;
  const [totalMaterials, totalViews, totalDownloads, recentMaterials] =
    await Promise.all([
      Material.countDocuments({ uploadedBy: userId }),
      Material.aggregate([
        { $match: { uploadedBy: userId } },
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Material.aggregate([
        { $match: { uploadedBy: userId } },
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      Material.find({ uploadedBy: userId })
        .populate("subject", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  const views = totalViews[0]?.total || 0;
  const downloads = totalDownloads[0]?.total || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Teacher Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your materials and track their performance
          </p>
        </div>
        <Link
          href="/teacher/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-xl text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all"
        >
          <Upload className="w-4 h-4" /> Upload Material
        </Link>
      </div>

      {/* Courses site is not production-ready. Uncomment when it is.
      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">Video courses studio</p>
          <p className="text-sm text-slate-600 mt-0.5">
            Create free/paid courses, certificates, and Razorpay earnings on courses.getmaterials.in
          </p>
        </div>
        <a
          href={process.env.NEXT_PUBLIC_COURSES_URL || "https://courses.getmaterials.in/teacher/dashboard"}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] text-white px-4 py-2.5 text-sm font-semibold shrink-0"
        >
          Open courses studio
        </a>
      </div>
      */}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: "Total Materials", value: totalMaterials, color: "text-violet-600 bg-violet-50" },
          { icon: Eye, label: "Total Views", value: views, color: "text-blue-600 bg-blue-50" },
          { icon: Download, label: "Total Downloads", value: downloads, color: "text-emerald-600 bg-emerald-50" },
          { icon: TrendingUp, label: "Avg Rating", value: "—", color: "text-amber-600 bg-amber-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-100">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent uploads */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Recent Uploads</h2>
          <Link href="/teacher/materials" className="text-sm text-violet-600 font-medium hover:underline">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentMaterials.length > 0 ? (
            recentMaterials.map((material: any) => (
              <div key={material._id.toString()} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  material.type === "video" ? "bg-blue-50" : "bg-violet-50"
                }`}>
                  {material.type === "video" ? (
                    <Video className="w-4 h-4 text-blue-600" />
                  ) : (
                    <FileText className="w-4 h-4 text-violet-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{material.title}</p>
                  <p className="text-xs text-slate-500">{(material.subject as any)?.name}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{material.views}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" />{material.downloads}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  material.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}>
                  {material.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Upload className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No materials uploaded yet</p>
              <Link href="/teacher/upload" className="text-sm text-violet-600 font-medium hover:underline mt-2 inline-block">
                Upload your first material →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
