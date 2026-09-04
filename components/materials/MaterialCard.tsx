import Link from "next/link";
import {
  FileText,
  Video,
  Link2,
  Image as ImageIcon,
  ClipboardCheck,
  Eye,
  Download,
  Star,
  BadgeCheck,
} from "lucide-react";
import BookmarkToggle from "./BookmarkToggle";
import { resolveThumbnailSrc } from "@/components/profile/FittedPhoto";

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "text-red-600 bg-red-50" },
  video: { icon: Video, label: "Video", color: "text-blue-600 bg-blue-50" },
  link: { icon: Link2, label: "Link", color: "text-emerald-600 bg-emerald-50" },
  image: { icon: ImageIcon, label: "Image", color: "text-purple-600 bg-purple-50" },
  assignment: { icon: ClipboardCheck, label: "Assignment", color: "text-amber-600 bg-amber-50" },
};

function formatFileSize(bytes?: number) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatCount(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export default function MaterialCard({
  material,
  view,
  bookmarked,
  loggedIn,
}: {
  material: any;
  view: "grid" | "list";
  bookmarked: boolean;
  loggedIn: boolean;
}) {
  const type = typeConfig[material.type] || typeConfig.pdf;
  const Icon = type.icon;
  const attachment = material.attachments?.[0];
  const sizeLabel = formatFileSize(attachment?.fileSize);
  const collegeName = material.college?.name;
  const semesterLabel = material.semester ? `Sem ${material.semester}` : null;
  const rating = material.rating?.average || 0;

  const preview = (
    <div className={`relative bg-slate-50 overflow-hidden ${view === "list" ? "w-40 h-28 shrink-0 rounded-xl" : "aspect-[16/10]"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveThumbnailSrc(material.thumbnailUrl)}
        alt=""
        className="w-full h-full object-cover"
      />
      {material.type === "video" && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-10 h-10 rounded-full bg-black/55 text-white flex items-center justify-center">
            <Video className="w-4 h-4" />
          </span>
        </span>
      )}
      {(sizeLabel || attachment?.fileName) && (
        <span className="absolute bottom-2 left-2 text-[10px] font-medium text-white bg-black/55 px-1.5 py-0.5 rounded">
          {sizeLabel || type.label}
        </span>
      )}
    </div>
  );

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${type.color}`}>
              <Icon className="w-3 h-3" />
              {type.label}
            </span>
            {semesterLabel && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-50 text-violet-700">
                {semesterLabel}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
            {material.title}
          </h3>
        </div>
        <BookmarkToggle
          materialId={String(material._id)}
          initialBookmarked={bookmarked}
          loggedIn={loggedIn}
        />
      </div>

      <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 min-w-0">
        <span className="truncate font-medium text-slate-700">{material.uploadedBy?.name || "Unknown"}</span>
        {material.uploadedBy?.role === "teacher" && (
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}
        {collegeName && (
          <>
            <span className="text-slate-300">·</span>
            <span className="truncate">{collegeName}</span>
          </>
        )}
      </div>

      {material.subject?.name && (
        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-medium text-slate-500">
          {material.subject.name}
        </span>
      )}

      <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
        <span className="inline-flex items-center gap-1">
          <Eye className="w-3 h-3" /> {formatCount(material.views || 0)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Download className="w-3 h-3" /> {formatCount(material.downloads || 0)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />{" "}
          {rating ? rating.toFixed(1) : "—"}
        </span>
      </div>
    </>
  );

  return (
    <Link
      href={`/materials/${material.slug}`}
      className={`group bg-white rounded-2xl border border-slate-100 hover:shadow-md hover:border-violet-100 transition-all ${
        view === "list" ? "flex gap-4 p-3" : "overflow-hidden"
      }`}
    >
      {preview}
      <div className={view === "list" ? "min-w-0 flex-1 py-0.5" : "p-4"}>{body}</div>
    </Link>
  );
}
