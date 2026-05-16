import { connectDB, Material, Subject } from "@getmaterials/database";
import {
  FileText,
  Video,
  Link2,
  Image,
  ClipboardCheck,
  Eye,
  Search,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Browse Materials - GetMaterials",
  description: "Browse all study materials",
};

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "text-red-600 bg-red-50" },
  video: { icon: Video, label: "Video", color: "text-blue-600 bg-blue-50" },
  link: { icon: Link2, label: "Link", color: "text-emerald-600 bg-emerald-50" },
  image: { icon: Image, label: "Image", color: "text-purple-600 bg-purple-50" },
  assignment: { icon: ClipboardCheck, label: "Assignment", color: "text-amber-600 bg-amber-50" },
};

export default async function MaterialsPage() {
  await connectDB();

  const [materials, subjects] = await Promise.all([
    Material.find({ status: "published", isPublic: true })
      .populate("subject", "name slug")
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Subject.find({}).sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Materials</h1>
        <p className="text-slate-500 mt-1">
          Explore study materials uploaded by teachers
        </p>
      </div>

      {/* Subject filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {subjects.map((subject: any) => (
          <Link
            key={subject._id.toString()}
            href={`/subjects/${subject.slug}`}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            {subject.name}
          </Link>
        ))}
      </div>

      {/* Materials grid */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No materials found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material: any) => {
            const type = typeConfig[material.type] || typeConfig.pdf;
            const Icon = type.icon;
            return (
              <Link
                key={material._id.toString()}
                href={`/materials/${material.slug}`}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md hover:border-violet-100 transition-all group"
              >
                {/* Thumbnail or gradient */}
                {material.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={material.thumbnailUrl}
                    alt={material.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className={`aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center`}>
                    <Icon className={`w-10 h-10 ${type.color.split(" ")[0]} opacity-50`} />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${type.color}`}>
                      <Icon className="w-3 h-3" />
                      {type.label}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-violet-700 transition-colors">
                    {material.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                    <span>{material.uploadedBy?.name || "Unknown"}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {material.views || 0}
                    </span>
                  </div>
                  {material.subject?.name && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-medium text-slate-500">
                      {material.subject.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
