import { auth } from "@/lib/auth";
import { connectDB, Material } from "@/lib/database";
import { FileText, Video, Link2, Plus } from "lucide-react";
import Link from "next/link";
import { TeacherMaterialActions } from "@/components/TeacherMaterialActions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Materials - GetMaterials",
};

export default async function MyMaterialsPage() {
  const session = await auth();
  if (!session?.user) return null;
  const role = (session.user as any).role || "student";

  await connectDB();
  const materials = await Material.find({ uploadedBy: (session.user as any).id })
    .populate("subject", "name")
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
          <p className="text-slate-500 mt-1">Edit, draft, or delete the materials you uploaded.</p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700"
        >
          <Plus className="w-4 h-4" />
          Upload
        </Link>
      </div>

      {materials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <p className="text-slate-600 font-medium">You have not uploaded any materials yet.</p>
          <Link href="/upload" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
            Upload your first material
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
          {materials.map((material: any) => {
            const typeInfo = typeConfig[material.type] || typeConfig.pdf;
            const TypeIcon = typeInfo.icon;
            return (
              <div key={String(material._id)} className="flex items-center gap-4 px-5 py-4">
                <Link
                  href={material.slug ? `/materials/${material.slug}` : `/my-materials/${material._id}/edit`}
                  className="flex items-center gap-4 min-w-0 flex-1 hover:opacity-80"
                >
                  <div className={`w-9 h-9 rounded-lg ${typeInfo.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{material.title}</p>
                    <p className="text-xs text-slate-500">{material.subject?.name || "—"}</p>
                  </div>
                </Link>
                <span
                  className={`text-xs font-medium capitalize px-2.5 py-1 rounded-lg border ${
                    statusConfig[material.status] || statusConfig.draft
                  }`}
                >
                  {String(material.status || "draft").replace("_", " ")}
                </span>
                <TeacherMaterialActions
                  material={{
                    _id: String(material._id),
                    title: material.title,
                    status: material.status,
                  }}
                  editHref={`/my-materials/${material._id}/edit`}
                  role={role}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
