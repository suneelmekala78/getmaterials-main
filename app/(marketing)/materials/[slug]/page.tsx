import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { connectDB, Material, User, MaterialView } from "@/lib/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Metadata } from "next";
import {
  FileText,
  Video,
  Link2,
  Image as ImageIcon,
  ClipboardCheck,
  Download,
  Eye,
  Star,
  Calendar,
  User as UserIcon,
  GraduationCap,
  School,
  BadgeCheck,
  Flag,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { MaterialReviews } from "@/components/MaterialReviews";
import DownloadButton from "@/components/DownloadButton";
import { ShareButton } from "@/components/ShareButton";
import BookmarkToggle from "@/components/materials/BookmarkToggle";
import {
  PreviewSection,
  VideoSection,
  type PreviewItem,
} from "@/components/materials/MaterialMedia";
import { isOfficeFile, isPdfFile, officeKindLabel } from "@/lib/file-kinds";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";
import { ratedAverageExpr } from "@/lib/rating-aggregate";

interface Props {
  params: Promise<{ slug: string }>;
}

const typeConfig: Record<string, { icon: any; label: string; color: string; gradient: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "text-red-600 bg-red-50", gradient: "from-indigo-700 to-violet-800" },
  video: { icon: Video, label: "Video", color: "text-blue-600 bg-blue-50", gradient: "from-blue-500 to-indigo-600" },
  link: { icon: Link2, label: "Link", color: "text-emerald-600 bg-emerald-50", gradient: "from-emerald-500 to-teal-600" },
  image: { icon: ImageIcon, label: "Image", color: "text-purple-600 bg-purple-50", gradient: "from-purple-500 to-violet-600" },
  assignment: { icon: ClipboardCheck, label: "Assignment", color: "text-amber-600 bg-amber-50", gradient: "from-amber-500 to-orange-600" },
};

const BASE_URL = SITE_URL;

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

function yearFromSemester(semester?: number) {
  if (!semester) return null;
  const year = Math.ceil(semester / 2);
  const ordinals = ["1st", "2nd", "3rd", "4th", "5th"];
  return `${ordinals[year - 1] || `${year}th`} Year`;
}

function stripHtml(html?: string) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function youtubeId(url?: string) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return match?.[1] || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const material = await Material.findOne({ slug, status: "published" })
    .select("title description thumbnailUrl tags type subject")
    .populate("subject", "name")
    .lean<any>();

  if (!material) return { title: "Material Not Found" };

  const plainDescription = stripHtml(material.description)
    .slice(0, 160) || `${material.title} - Free study material on GetMaterials`;

  const ogImage = material.thumbnailUrl || absoluteUrl(DEFAULT_OG_IMAGE.url);

  return {
    title: { absolute: `${material.title} - GetMaterials` },
    description: plainDescription,
    keywords: material.tags?.length ? material.tags.join(", ") : undefined,
    openGraph: {
      title: material.title,
      description: plainDescription,
      url: `${BASE_URL}/materials/${slug}`,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: material.title,
          type: "image/jpeg",
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: material.title,
      description: plainDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/materials/${slug}`,
    },
  };
}

export default async function MaterialViewPage({ params }: Props) {
  const { slug } = await params;

  await connectDB();
  const session = await auth();
  const currentUserId = (session?.user as any)?.id || null;

  const material: any = await Material.findOne({ slug, status: "published", isPublic: true })
    .populate("subject", "name slug")
    .populate("chapter", "title slug")
    .populate({
      path: "uploadedBy",
      select: "name avatar slug role emailVerified college",
      populate: { path: "college", select: "name" },
    })
    .populate("college", "name")
    .populate("colleges", "name")
    .lean();

  if (!material) notFound();

  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const viewer = currentUserId || ip;
  const today = new Date().toISOString().split("T")[0];

  try {
    await MaterialView.create({ material: material._id, viewer, date: today });
    await Material.updateOne({ _id: material._id }, { $inc: { views: 1 } });
  } catch (err: any) {
    if (err?.code !== 11000) {
      console.error("View tracking error:", err);
    }
  }

  const published = { status: "published", isPublic: true };
  const uploaderId = material.uploadedBy?._id;
  const uploaderSlug = material.uploadedBy?.slug || uploaderId;

  const [relatedMaterials, moreFromUploader, uploaderStats, bookmarkUser] = await Promise.all([
    Material.find({
      ...published,
      subject: material.subject?._id,
      _id: { $ne: material._id },
    })
      .populate("uploadedBy", "name")
      .sort({ downloads: -1, createdAt: -1 })
      .limit(8)
      .lean(),
    uploaderId
      ? Material.find({
          ...published,
          uploadedBy: uploaderId,
          _id: { $ne: material._id },
        })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean()
      : [],
    uploaderId
      ? Material.aggregate([
          { $match: { ...published, uploadedBy: uploaderId } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              downloads: { $sum: "$downloads" },
              avgRating: ratedAverageExpr,
            },
          },
        ])
      : [],
    currentUserId ? User.findById(currentUserId).select("bookmarks").lean() : null,
  ]);

  const bookmarked = ((bookmarkUser as any)?.bookmarks || []).some(
    (id: any) => String(id) === String(material._id)
  );

  const type = typeConfig[material.type] || typeConfig.pdf;
  const attachments = material.attachments || [];
  const primaryAttachment = attachments[0];
  const primaryFileUrl = primaryAttachment?.fileUrl;
  const primaryExternalUrl = primaryAttachment?.externalUrl;
  const fileSize = formatFileSize(primaryAttachment?.fileSize || material.fileSize);
  const collegeNames = Array.from(
    new Set(
      [
        ...((material.colleges || []).map((c: any) => c?.name).filter(Boolean)),
        material.college?.name,
      ].filter(Boolean)
    )
  );
  const collegeName = collegeNames.join(", ") || material.uploadedBy?.college?.name;
  const yearLabel = yearFromSemester(material.semester);
  const yearBranch = [yearLabel, material.branch].filter(Boolean).join(" · ");
  const uploadedDate = new Date(material.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const ratingAvg = material.rating?.average || 0;
  const ratingCount = material.rating?.count || 0;

  const videos: PreviewItem[] = attachments
    .filter((att: any) => att.type === "video" || youtubeId(att.externalUrl))
    .map((att: any) => ({
      kind: "video" as const,
      title: att.fileName || material.title,
      url: att.externalUrl || att.fileUrl,
      youtubeId: youtubeId(att.externalUrl),
    }));
  if (material.type === "video" && primaryExternalUrl && !videos.some((v) => v.url === primaryExternalUrl)) {
    videos.unshift({
      kind: "video",
      title: material.title,
      url: primaryExternalUrl,
      youtubeId: youtubeId(primaryExternalUrl),
    });
  }

  const previewItems: PreviewItem[] = [];
  if (isPdfFile({ type: material.type, fileUrl: primaryFileUrl, mimeType: primaryAttachment?.mimeType, fileName: primaryAttachment?.fileName }) && primaryFileUrl) {
    previewItems.push({
      kind: "pdf",
      title: material.title,
      url: primaryFileUrl,
      thumbnail: material.thumbnailUrl,
    });
  }
  if (material.type === "image" && primaryFileUrl) {
    previewItems.push({
      kind: "image",
      title: material.title,
      url: primaryFileUrl,
      thumbnail: material.thumbnailUrl || primaryFileUrl,
    });
  }
  if (material.type === "video" && videos[0]) {
    previewItems.push(videos[0]);
  }
  attachments.forEach((att: any) => {
    const url = att.fileUrl || att.externalUrl;
    if (!url || previewItems.some((item) => item.url === url)) return;
    if (isPdfFile(att) && att.fileUrl) {
      previewItems.push({ kind: "pdf", title: att.fileName || "PDF", url: att.fileUrl });
    }
    if (att.type === "image" && att.fileUrl) {
      previewItems.push({ kind: "image", title: att.fileName || "Image", url: att.fileUrl, thumbnail: att.fileUrl });
    }
    if (isOfficeFile(att) && att.fileUrl) {
      previewItems.push({
        kind: "office",
        title: att.fileName || material.title,
        url: att.fileUrl,
        officeKind: officeKindLabel(att),
      });
    }
  });
  const officeFiles = attachments
    .filter((att: any) => isOfficeFile(att) || isPdfFile(att))
    .map((att: any) => ({
      title: material.title,
      url: att.fileUrl,
      fileName: att.fileName,
      size: formatFileSize(att.fileSize),
      kind: isPdfFile(att) ? "PDF" : officeKindLabel(att),
    }));
  const fileKind = officeFiles[0]?.kind || type.label;
  const uploader = uploaderStats[0] || { count: 0, downloads: 0, avgRating: 0 };
  const verified = material.uploadedBy?.role === "teacher" || Boolean(material.uploadedBy?.emailVerified);
  const plainDescription = stripHtml(material.description);
  const downloadUrl = primaryFileUrl || primaryExternalUrl;
  const pageUrl = `${BASE_URL}/materials/${slug}`;
  const btnOutline =
    "inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 bg-white text-slate-700 font-semibold rounded-xl hover:border-violet-300 hover:text-violet-600 transition-colors text-sm";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: material.title,
            description: plainDescription,
            url: pageUrl,
            image: material.thumbnailUrl || absoluteUrl(DEFAULT_OG_IMAGE.url),
            inLanguage: "en",
            isAccessibleForFree: true,
            learningResourceType: type.label,
            educationalLevel: material.program || undefined,
            about: material.subject?.name
              ? { "@type": "Thing", name: material.subject.name }
              : undefined,
            author: { "@type": "Person", name: material.uploadedBy?.name || "Unknown" },
            provider: {
              "@type": "EducationalOrganization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            datePublished: material.createdAt,
            dateModified: material.updatedAt,
            ...(ratingAvg > 0 && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: ratingAvg,
                ratingCount: ratingCount,
              },
            }),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Materials", item: absoluteUrl("/materials") },
              ...(material.subject?.slug
                ? [
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: material.subject.name,
                      item: absoluteUrl(`/subjects/${material.subject.slug}`),
                    },
                  ]
                : []),
              {
                "@type": "ListItem",
                position: material.subject?.slug ? 4 : 3,
                name: material.title,
                item: pageUrl,
              },
            ],
          }),
        }}
      />

      <main className="bg-[#fafafa] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-slate-400 mb-5">
            <Link href="/" className="hover:text-[var(--primary)]">
              Home
            </Link>
            <span className="mx-1.5">›</span>
            <Link href="/materials" className="hover:text-[var(--primary)]">
              Materials
            </Link>
            {material.subject?.name && (
              <>
                <span className="mx-1.5">›</span>
                <Link
                  href={`/materials?subject=${material.subject.slug}`}
                  className="hover:text-[var(--primary)]"
                >
                  {material.subject.name}
                </Link>
              </>
            )}
            <span className="mx-1.5">›</span>
            <span className="text-slate-600">{material.title}</span>
          </p>

          <section className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7 mb-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={material.thumbnailUrl || "/images/default-thumbnail.png"}
                  alt={material.title}
                  className="w-full lg:w-44 h-32 object-cover rounded-2xl"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    {material.subject?.name && (
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 mb-2">
                        {material.subject.name}
                      </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                      {material.title}
                      <span className="ml-2 align-middle inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700">
                        Free
                      </span>
                    </h1>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-lg font-extrabold text-slate-900">
                        {ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
                      </span>
                      <span className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(ratingAvg)
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">({ratingCount} ratings)</p>
                    <div className="flex items-center justify-end gap-3 mt-2">
                      <BookmarkToggle
                        materialId={String(material._id)}
                        initialBookmarked={bookmarked}
                        loggedIn={Boolean(currentUserId)}
                        label="Save for later"
                        callbackUrl={`/materials/${slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[var(--primary)]"
                      />
                      <Link
                        href={`/feedback`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Report
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 text-sm text-slate-600">
                  <MetaItem
                    icon={<FileText className="w-4 h-4 text-[var(--primary)]" />}
                    label={`${fileKind}${fileSize ? ` (${fileSize})` : ""}`}
                  />
                  <MetaItem
                    icon={<UserIcon className="w-4 h-4 text-[var(--primary)]" />}
                    label={`${material.uploadedBy?.name || "Unknown"}${material.uploadedBy?.college?.name ? ` (${material.uploadedBy.college.name})` : ""}`}
                  />
                  {yearBranch && (
                    <MetaItem
                      icon={<GraduationCap className="w-4 h-4 text-[var(--primary)]" />}
                      label={yearBranch}
                    />
                  )}
                  {collegeNames.length > 0 && (
                    <MetaItem
                      icon={<School className="w-4 h-4 text-[var(--primary)]" />}
                      label={collegeNames.join(" · ")}
                    />
                  )}
                  <MetaItem
                    icon={<Calendar className="w-4 h-4 text-[var(--primary)]" />}
                    label={`${uploadedDate} (Uploaded)`}
                  />
                  <MetaItem
                    icon={<Download className="w-4 h-4 text-[var(--primary)]" />}
                    label={`${formatCount(material.downloads || 0)} Downloads`}
                  />
                  <MetaItem
                    icon={<Eye className="w-4 h-4 text-[var(--primary)]" />}
                    label={`${formatCount(material.views || 0)} Views`}
                  />
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  {downloadUrl && material.type !== "video" && material.type !== "link" && primaryFileUrl ? (
                    <DownloadButton
                      materialId={String(material._id)}
                      fileUrl={primaryFileUrl}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
                    >
                      <Download className="w-4 h-4" /> Download
                    </DownloadButton>
                  ) : primaryExternalUrl ? (
                    <a
                      href={primaryExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {material.type === "video" ? "Watch" : "Open"}
                    </a>
                  ) : null}
                  <BookmarkToggle
                    materialId={String(material._id)}
                    initialBookmarked={bookmarked}
                    loggedIn={Boolean(currentUserId)}
                    label="Save"
                    callbackUrl={`/materials/${slug}`}
                    className={btnOutline}
                  />
                  <ShareButton
                    title={material.title}
                    description={plainDescription}
                    url={pageUrl}
                    className={btnOutline}
                  />
                </div>

                {plainDescription ? (
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900 mb-2">About this material</h2>
                    <div
                      className="material-description prose prose-sm max-w-none text-slate-600 break-words [&_*]:max-w-full [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-violet-600"
                      dangerouslySetInnerHTML={{ __html: material.description }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <PreviewSection
                items={previewItems}
                files={officeFiles}
                materialId={String(material._id)}
              />
              <VideoSection videos={videos} />

              {relatedMaterials.length > 0 && (
                <section id="more" className="scroll-mt-28">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">More Materials</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {relatedMaterials.map((item: any) => (
                      <RelatedCard key={String(item._id)} item={item} />
                    ))}
                  </div>
                </section>
              )}

              <section id="reviews" className="scroll-mt-28">
                <MaterialReviews
                  materialId={String(material._id)}
                  currentUserId={currentUserId}
                  materialSlug={slug}
                />
              </section>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <Link
                  href={uploaderSlug ? `/users/${uploaderSlug}` : "#"}
                  className="flex items-center gap-3 rounded-xl hover:bg-slate-50 -m-1 p-1 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={material.uploadedBy?.avatar || (material.uploadedBy?.role === "teacher" ? "/images/default-teacher-pic.png" : "/images/default-profile-pic.png")}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 flex items-center gap-1">
                      {material.uploadedBy?.name || "Unknown"}
                      {verified && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{material.uploadedBy?.college?.name || collegeName || "GetMaterials contributor"}</p>
                  </div>
                </Link>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{uploader.count || 0}</p>
                    <p className="text-[10px] text-slate-500">Materials</p>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{formatCount(uploader.downloads || 0)}</p>
                    <p className="text-[10px] text-slate-500">Downloads</p>
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">
                      {uploader.avgRating ? Number(uploader.avgRating).toFixed(1) : "—"}
                    </p>
                    <p className="text-[10px] text-slate-500">Rating</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-3">Uploaded on {uploadedDate}</p>
              </div>

              {moreFromUploader.length > 0 && (
                <SidebarList
                  title="More from this uploader"
                  href={`/materials?q=${encodeURIComponent(material.uploadedBy?.name || "")}`}
                  items={moreFromUploader}
                />
              )}

              {relatedMaterials.length > 0 && (
                <SidebarList
                  title="Related Materials"
                  href={material.subject?.slug ? `/materials?subject=${material.subject.slug}` : "/materials"}
                  items={relatedMaterials.slice(0, 3)}
                />
              )}
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function MetaItem({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function RelatedCard({ item }: { item: any }) {
  return (
    <Link
      href={`/materials/${item.slug}`}
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 transition-colors"
    >
      <div className="aspect-[16/9] bg-slate-50 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.thumbnailUrl || "/images/default-thumbnail.png"}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <p className="font-semibold text-slate-900 text-sm line-clamp-2">{item.title}</p>
        <p className="text-xs text-slate-400 mt-1">
          {item.uploadedBy?.name || "Unknown"} · {formatCount(item.downloads || 0)} downloads
        </p>
      </div>
    </Link>
  );
}

function SidebarList({ title, href, items }: { title: string; href: string; items: any[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
        <Link href={href} className="text-xs font-semibold text-[var(--primary)] hover:underline">
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {items.map((item) => {
          const type = typeConfig[item.type] || typeConfig.pdf;
          return (
            <Link key={String(item._id)} href={`/materials/${item.slug}`} className="flex items-start gap-3 group">
              <span className={`mt-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${type.color}`}>
                {type.label}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-800 group-hover:text-[var(--primary)] line-clamp-2">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatCount(item.downloads || 0)} downloads
                  {item.uploadedBy?.name ? ` · ${item.uploadedBy.name}` : ""}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
