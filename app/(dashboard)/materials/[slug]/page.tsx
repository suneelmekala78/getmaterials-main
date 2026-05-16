import { notFound } from "next/navigation";
import { connectDB, Material, Subject, Chapter } from "@getmaterials/database";
import { auth } from "@/lib/auth";
import {
  FileText,
  Video,
  Link2,
  Image,
  ClipboardCheck,
  Download,
  Eye,
  Star,
  Calendar,
  User,
  Tag,
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Layers,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { MaterialReviews } from "@/components/MaterialReviews";

interface Props {
  params: Promise<{ slug: string }>;
}

const typeConfig: Record<
  string,
  { icon: any; label: string; color: string; gradient: string }
> = {
  pdf: {
    icon: FileText,
    label: "PDF / Notes",
    color: "text-red-600 bg-red-50",
    gradient: "from-red-500 to-rose-600",
  },
  video: {
    icon: Video,
    label: "Video",
    color: "text-blue-600 bg-blue-50",
    gradient: "from-blue-500 to-indigo-600",
  },
  link: {
    icon: Link2,
    label: "External Link",
    color: "text-emerald-600 bg-emerald-50",
    gradient: "from-emerald-500 to-teal-600",
  },
  image: {
    icon: Image,
    label: "Image",
    color: "text-purple-600 bg-purple-50",
    gradient: "from-purple-500 to-violet-600",
  },
  assignment: {
    icon: ClipboardCheck,
    label: "Assignment",
    color: "text-amber-600 bg-amber-50",
    gradient: "from-amber-500 to-orange-600",
  },
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const material = await Material.findOne({ slug, status: "published" })
    .select("title description")
    .lean();
  if (!material) return { title: "Material Not Found" };
  return {
    title: (material as any).title,
    description:
      (material as any).description ||
      `View ${(material as any).title} on GetMaterials`,
  };
}

export default async function MaterialViewPage({ params }: Props) {
  const { slug } = await params;

  await connectDB();
  const session = await auth();
  const currentUserId = (session?.user as any)?.id || null;

  const material: any = await Material.findOneAndUpdate(
    { slug, status: "published", isPublic: true },
    { $inc: { views: 1 } },
    { new: true },
  )
    .populate("subject", "name slug")
    .populate("chapter", "title slug")
    .populate("uploadedBy", "name avatar")
    .lean();

  if (!material) notFound();

  const type = typeConfig[material.type] || typeConfig.pdf;
  const Icon = type.icon;

  // Get related materials from same chapter
  const relatedMaterials: any[] = await Material.find({
    chapter: material.chapter?._id,
    status: "published",
    isPublic: true,
    _id: { $ne: material._id },
  })
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        {material.thumbnailUrl ? (
          <div className="relative aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>
        ) : (
          <div
            className={`aspect-video bg-gradient-to-br ${type.gradient} relative`}
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-6 right-8">
                <Icon className="w-32 h-32 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb overlay */}
        <div className="absolute top-4 left-4">
          <Link
            href={
              material.subject?.slug
                ? `/subjects/${material.subject.slug}`
                : "/subjects"
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-slate-700 hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {material.subject?.name || "Back"}
          </Link>
        </div>

        {/* Type badge overlay */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-slate-700">
            <Icon className="w-3.5 h-3.5" />
            {type.label}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content — Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Description Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {material.title}
            </h1>

            {material.description && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <div
                  className="prose prose-sm max-w-none text-slate-600 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-violet-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-violet-600 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: material.description }}
                />
              </div>
            )}

            {/* Tags */}
            {material.tags?.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex flex-wrap gap-2">
                  {material.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-600 text-xs font-medium rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content Viewer */}
          {material.type === "pdf" && material.fileUrl && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Document Preview
                </span>
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-violet-600 hover:text-violet-700"
                >
                  Open in new tab ↗
                </a>
              </div>
              <iframe
                src={material.fileUrl}
                className="w-full h-[500px] sm:h-[650px]"
                title={material.title}
              />
            </div>
          )}

          {material.type === "video" && material.externalUrl && (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {material.externalUrl.includes("youtube") ||
              material.externalUrl.includes("youtu.be") ? (
                <div className="aspect-video">
                  <iframe
                    src={material.externalUrl
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "youtube.com/embed/")}
                    className="w-full h-full"
                    title={material.title}
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Video className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-4">External video link</p>
                  <a
                    href={material.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Watch Video
                  </a>
                </div>
              )}
            </div>
          )}

          {material.type === "image" && material.fileUrl && (
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={material.fileUrl}
                alt={material.title}
                className="max-w-full h-auto rounded-xl mx-auto"
              />
            </div>
          )}

          {/* Attachments — skip index 0 which is the primary content */}
          {material.attachments?.slice(1).length > 0 && (
            <div className="space-y-4">
              <div className="px-1">
                <h2 className="text-base font-bold text-slate-900">
                  Attachments ({material.attachments.slice(1).length})
                </h2>
              </div>
              {material.attachments.slice(1).map((att: any, idx: number) => {
                const attType = typeConfig[att.type] || typeConfig.pdf;
                const AttIcon = attType.icon;

                if (att.type === "pdf" && att.fileUrl) {
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <AttIcon className="w-4 h-4 text-red-500" />
                          {att.fileName || `Document ${idx + 1}`}
                        </span>
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-violet-600 hover:text-violet-700"
                        >
                          Open in new tab ↗
                        </a>
                      </div>
                      <iframe
                        src={att.fileUrl}
                        className="w-full h-[500px] sm:h-[650px]"
                        title={att.fileName || `Attachment ${idx + 1}`}
                      />
                    </div>
                  );
                }

                if (att.type === "video" && (att.externalUrl || att.fileUrl)) {
                  const videoUrl = att.externalUrl || att.fileUrl;
                  const isYoutube = videoUrl.includes("youtube") || videoUrl.includes("youtu.be");
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="px-6 py-3 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <AttIcon className="w-4 h-4 text-blue-500" />
                          {att.fileName || `Video ${idx + 1}`}
                        </span>
                      </div>
                      {isYoutube ? (
                        <div className="aspect-video">
                          <iframe
                            src={videoUrl
                              .replace("watch?v=", "embed/")
                              .replace("youtu.be/", "youtube.com/embed/")}
                            className="w-full h-full"
                            title={att.fileName || `Video ${idx + 1}`}
                            allowFullScreen
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" /> Watch Video
                          </a>
                        </div>
                      )}
                    </div>
                  );
                }

                if (att.type === "image" && att.fileUrl) {
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                      <div className="px-6 py-3 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <AttIcon className="w-4 h-4 text-purple-500" />
                          {att.fileName || `Image ${idx + 1}`}
                        </span>
                      </div>
                      <div className="p-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.fileUrl}
                          alt={att.fileName || `Attachment ${idx + 1}`}
                          className="max-w-full h-auto rounded-xl mx-auto"
                        />
                      </div>
                    </div>
                  );
                }

                if (att.type === "link" && att.externalUrl) {
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${attType.color} flex items-center justify-center shrink-0`}>
                        <AttIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {att.fileName || `Link ${idx + 1}`}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{att.externalUrl}</p>
                      </div>
                      <a
                        href={att.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open
                      </a>
                    </div>
                  );
                }

                // Default: downloadable file (assignment or other)
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${attType.color} flex items-center justify-center shrink-0`}>
                      <AttIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {att.fileName || `${attType.label} ${idx + 1}`}
                      </p>
                      {att.fileSize && (
                        <p className="text-xs text-slate-400">
                          {(att.fileSize / 1024 / 1024).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                    {att.fileUrl && (
                      <a
                        href={att.fileUrl}
                        download
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Related Materials */}
          {relatedMaterials.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">
                  More from {material.chapter?.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {relatedMaterials.length} related materials
                </p>
              </div>
              <div className="divide-y divide-slate-50">
                {relatedMaterials.map((rel: any) => {
                  const relType = typeConfig[rel.type] || typeConfig.pdf;
                  const RelIcon = relType.icon;
                  return (
                    <Link
                      key={rel._id.toString()}
                      href={`/materials/${rel.slug}`}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-violet-50/50 transition-colors group"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl ${relType.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                      >
                        <RelIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-violet-700 transition-colors">
                          {rel.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {rel.uploadedBy?.name || "Unknown"} · {rel.views || 0}{" "}
                          views
                        </p>
                      </div>
                      <span
                        className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide ${relType.color}`}
                      >
                        {relType.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews & Ratings */}
          <MaterialReviews materialId={material._id.toString()} currentUserId={currentUserId} />
        </div>

        {/* Sidebar — Right */}
        <div className="space-y-5">
          {/* Action Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
            {material.type === "pdf" && material.fileUrl && (
              <>
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
                >
                  <Eye className="w-4 h-4" /> View PDF
                </a>
                <a
                  href={material.fileUrl}
                  download
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-violet-300 hover:text-violet-600 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
              </>
            )}
            {material.type === "video" && material.externalUrl && (
              <a
                href={material.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Watch Video
              </a>
            )}
            {material.type === "link" && material.externalUrl && (
              <a
                href={material.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open Link
              </a>
            )}
            {material.type === "image" && material.fileUrl && (
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Eye className="w-4 h-4" /> View Full Size
              </a>
            )}
            {material.type === "assignment" && material.fileUrl && (
              <a
                href={material.fileUrl}
                download
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Assignment
              </a>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Eye className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">
                  {material.views || 0}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">Views</p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-xl">
                <Download className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-slate-900">
                  {material.downloads || 0}
                </p>
                <p className="text-[10px] text-slate-500 uppercase">
                  Downloads
                </p>
              </div>
              {material.rating?.average > 0 && (
                <div className="text-center p-3 bg-slate-50 rounded-xl col-span-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900">
                    {material.rating.average.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {material.rating.count} ratings
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Uploader Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Uploaded by
            </h3>
            <div className="flex items-center gap-3">
              {material.uploadedBy?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={material.uploadedBy.avatar}
                  alt={material.uploadedBy.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                  {material.uploadedBy?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {material.uploadedBy?.name || "Unknown"}
                </p>
                <p className="text-xs text-slate-400">Teacher</p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase">
                    Subject
                  </p>
                  <Link
                    href={`/subjects/${material.subject?.slug}`}
                    className="text-sm font-medium text-slate-900 hover:text-violet-600 truncate block"
                  >
                    {material.subject?.name || "—"}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase">
                    Chapter
                  </p>
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {material.chapter?.title || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-400 uppercase">
                    Uploaded
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(material.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {material.fileSize && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase">
                      File Size
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {(material.fileSize / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
