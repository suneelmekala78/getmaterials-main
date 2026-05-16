import { notFound } from "next/navigation";
import { connectDB, Subject, Chapter, Material } from "@getmaterials/database";
import { FileText, Video, Link2, Image, ClipboardCheck, Download, Eye, Star } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

const typeIcons: Record<string, any> = {
  pdf: FileText,
  video: Video,
  link: Link2,
  image: Image,
  assignment: ClipboardCheck,
};

const typeColors: Record<string, string> = {
  pdf: "text-red-500 bg-red-50",
  video: "text-blue-500 bg-blue-50",
  link: "text-emerald-500 bg-emerald-50",
  image: "text-purple-500 bg-purple-50",
  assignment: "text-amber-500 bg-amber-50",
};

export default async function SubjectDetailPage({ params }: Props) {
  const { slug } = await params;

  await connectDB();

  const subject = await Subject.findOne({ slug, isActive: true }).lean();
  if (!subject) notFound();

  const [chapters, materials] = await Promise.all([
    Chapter.find({ subject: (subject as any)._id }).sort({ order: 1 }).lean(),
    Material.find({ subject: (subject as any)._id, status: "published", isPublic: true })
      .populate("chapter", "title slug")
      .populate("uploadedBy", "name avatar")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  // Group materials by chapter
  const materialsByChapter = chapters.map((chapter: any) => ({
    ...chapter,
    materials: materials.filter(
      (m: any) => m.chapter?._id?.toString() === chapter._id.toString()
    ),
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Subject header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {(subject as any).name}
            </h1>
            {(subject as any).description && (
              <p className="text-slate-500 mt-2 max-w-2xl">
                {(subject as any).description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span>{chapters.length} chapters</span>
              <span>{materials.length} materials</span>
              <span className="capitalize">{(subject as any).category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters and materials */}
      <div className="space-y-6">
        {materialsByChapter.map((chapter: any) => (
          <div
            key={chapter._id.toString()}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          >
            {/* Chapter header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900">
                {chapter.title}
              </h2>
              {chapter.description && (
                <p className="text-sm text-slate-500 mt-0.5">
                  {chapter.description}
                </p>
              )}
            </div>

            {/* Materials list */}
            <div className="divide-y divide-slate-50">
              {chapter.materials.length > 0 ? (
                chapter.materials.map((material: any) => {
                  const Icon = typeIcons[material.type] || FileText;
                  const colorClass = typeColors[material.type] || "text-slate-500 bg-slate-50";

                  return (
                    <Link
                      key={material._id.toString()}
                      href={`/materials/${material.slug}`}
                      className="block px-6 py-4 hover:bg-slate-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                            {material.title}
                          </h3>
                          {material.description && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                              {material.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" /> {material.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" /> {material.downloads}
                            </span>
                            {material.rating?.average > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                {material.rating.average.toFixed(1)}
                              </span>
                            )}
                            <span>
                              by {(material.uploadedBy as any)?.name || "Unknown"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 text-xs font-medium text-violet-600 bg-violet-50 rounded-lg">
                            View →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="px-6 py-8 text-center text-sm text-slate-400">
                  No materials in this chapter yet.
                </div>
              )}
            </div>
          </div>
        ))}

        {materialsByChapter.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No chapters yet
            </h3>
            <p className="text-sm text-slate-500">
              Chapters and materials will appear here once teachers upload them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
