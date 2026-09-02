import { auth } from "@/lib/auth";
import { connectDB, User, Material } from "@/lib/database";
import { Bookmark, FileText, Video, Link2, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import RemoveBookmarkButton from "./RemoveBookmarkButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bookmarks - GetMaterials",
};

export default async function BookmarksPage() {
  const session = await auth();
  if (!session?.user) return null;

  await connectDB();

  const user = await User.findById(session.user.id).select("bookmarks");
  const bookmarkedMaterials = user?.bookmarks?.length
    ? await Material.find({ _id: { $in: user.bookmarks } })
        .populate("subject", "name slug")
        .select("title slug type subject views createdAt")
        .lean()
    : [];

  const typeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4 text-blue-600" />;
      case "link": return <Link2 className="w-4 h-4 text-emerald-600" />;
      default: return <FileText className="w-4 h-4 text-violet-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Bookmarks</h1>
        <p className="text-slate-500 mt-1">Materials you&apos;ve saved for later.</p>
      </div>

      {bookmarkedMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedMaterials.map((material: any) => (
            <div
              key={material._id?.toString()}
              className="group bg-white rounded-xl p-5 border border-slate-100 hover:border-violet-100 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
                  {typeIcon(material.type)}
                </div>
                <RemoveBookmarkButton materialId={material._id?.toString()} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">
                {material.title}
              </h3>
              <p className="text-xs text-slate-500 mb-3">{material.subject?.name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Saved {new Date(material.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-7 h-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No bookmarks yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            When you find study materials you like, bookmark them to access them quickly later.
          </p>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 transition-colors"
          >
            Browse Subjects
          </Link>
        </div>
      )}
    </div>
  );
}
