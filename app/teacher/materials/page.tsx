import { auth } from "@/lib/auth";
import { connectDB, Material } from "@/lib/database";
import { FileText, Video, Link2, Eye, Plus, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { TeacherMaterialActions } from "@/components/TeacherMaterialActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Materials - Teacher - GetMaterials",
};

export default async function TeacherMaterialsPage() {
  const session = await auth();
  if (!session?.user) return null;

  await connectDB();

  const materials = await Material.find({ uploadedBy: (session.user as any).id })
    .populate("subject", "name slug")
    .populate("chapter", "title")
    .sort({ createdAt: -1 })
    .lean();

  const typeConfig: Record<string, { icon: any; color: string }> = {
    pdf: { icon: FileText, color: "bg-violet-50 text-violet-600" },
    video: { icon: Video, color: "bg-blue-50 text-blue-600" },
    link: { icon: Link2, color: "bg-emerald-50 text-emerald-600" },
  };

  const statusConfig: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-100",
    under_review: "bg-amber-50 text-amber-700 border-amber-100",
    draft: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Materials</h1>
          <p className="text-slate-500 mt-1">Manage your uploaded study materials.</p>
        </div>
        <Link
          href="/teacher/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Upload New
        </Link>
      </div>

      {materials.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Material</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Views</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {materials.map((material: any) => {
                  const typeInfo = typeConfig[material.type] || typeConfig.pdf;
                  const TypeIcon = typeInfo.icon;
                  return (
                    <tr key={material._id.toString()} className="table-row-hover">
                      <td className="px-5 py-4">
                        <Link href={`/materials/${material.slug}`} className="flex items-center gap-3 group">
                          <div className={`w-9 h-9 rounded-lg ${typeInfo.color} flex items-center justify-center shrink-0`}>
                            <TypeIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-[200px] group-hover:text-violet-600 transition-colors">{material.title}</p>
                            <p className="text-xs text-slate-500">{(material.chapter as any)?.title || "—"}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {(material.subject as any)?.name || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg border ${statusConfig[material.status] || statusConfig.draft}`}>
                          {material.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {material.views || 0}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(material.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <TeacherMaterialActions
                          material={{
                            _id: material._id.toString(),
                            title: material.title,
                            status: material.status,
                          }}
                          role={(session.user as any).role}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No materials uploaded yet</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Start sharing your knowledge with students by uploading your first material.
          </p>
          <Link
            href="/teacher/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Material
          </Link>
        </div>
      )}
    </div>
  );
}
