import { connectDB, Material, Subject } from "@getmaterials/database";
import {
  FileText,
  Video,
  Link2,
  Image,
  ClipboardCheck,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Study Materials - GetMaterials",
  description: "Browse free study materials, notes, question papers, videos, and resources uploaded by verified teachers. Download PDFs, watch video lectures, and more.",
  openGraph: {
    title: "Browse Study Materials - GetMaterials",
    description: "Browse free study materials, notes, question papers, videos, and resources uploaded by verified teachers.",
    type: "website",
  },
};

const typeConfig: Record<string, { icon: any; label: string; color: string }> = {
  pdf: { icon: FileText, label: "PDF", color: "text-red-600 bg-red-50" },
  video: { icon: Video, label: "Video", color: "text-blue-600 bg-blue-50" },
  link: { icon: Link2, label: "Link", color: "text-emerald-600 bg-emerald-50" },
  image: { icon: Image, label: "Image", color: "text-purple-600 bg-purple-50" },
  assignment: { icon: ClipboardCheck, label: "Assignment", color: "text-amber-600 bg-amber-50" },
};

const categoryLabels: Record<string, string> = {
  notes: "Notes",
  question_paper: "Question Paper",
  syllabus: "Syllabus",
  assignment: "Assignment",
  lab_manual: "Lab Manual",
  reference: "Reference",
  other: "Other",
};

interface Props {
  searchParams: Promise<{ type?: string; category?: string; subject?: string; q?: string }>;
}

export default async function MaterialsPage({ searchParams }: Props) {
  const params = await searchParams;
  await connectDB();

  // Build filter query
  const filter: any = { status: "published", isPublic: true };
  if (params.type && ["pdf", "video", "link", "image", "assignment"].includes(params.type)) {
    filter.type = params.type;
  }
  if (params.category && Object.keys(categoryLabels).includes(params.category)) {
    filter.materialCategory = params.category;
  }

  const [subjects, subjectForFilter] = await Promise.all([
    Subject.find({}).sort({ name: 1 }).lean(),
    params.subject ? Subject.findOne({ slug: params.subject }).lean() : null,
  ]);

  if (subjectForFilter) {
    filter.subject = (subjectForFilter as any)._id;
  }

  if (params.q) {
    filter.title = { $regex: params.q, $options: "i" };
  }

  const materials = await Material.find(filter)
    .populate("subject", "name slug")
    .populate("uploadedBy", "name role")
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Materials</h1>
        <p className="text-slate-500 mt-1">
          Explore study materials uploaded by teachers and students
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 space-y-4">
        {/* Search */}
        <form className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
          {/* Hidden fields to preserve other filters */}
          {params.type && <input type="hidden" name="type" value={params.type} />}
          {params.category && <input type="hidden" name="category" value={params.category} />}
          {params.subject && <input type="hidden" name="subject" value={params.subject} />}
        </form>

        {/* Filter chips row */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />

          {/* Type filters */}
          <Link
            href={{ pathname: "/materials", query: { ...params, type: undefined } }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!params.type ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"}`}
          >
            All Types
          </Link>
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Link
                key={key}
                href={{ pathname: "/materials", query: { ...params, type: key } }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${params.type === key ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"}`}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </Link>
            );
          })}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium w-16">Category:</span>
          <Link
            href={{ pathname: "/materials", query: { ...params, category: undefined } }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!params.category ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"}`}
          >
            All
          </Link>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Link
              key={key}
              href={{ pathname: "/materials", query: { ...params, category: key } }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${params.category === key ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Subject filter chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium w-16">Subject:</span>
          <Link
            href={{ pathname: "/materials", query: { ...params, subject: undefined } }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!params.subject ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"}`}
          >
            All
          </Link>
          {subjects.map((subject: any) => (
            <Link
              key={subject._id.toString()}
              href={{ pathname: "/materials", query: { ...params, subject: subject.slug } }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${params.subject === subject.slug ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600"}`}
            >
              {subject.name}
            </Link>
          ))}
        </div>

        {/* Active filters indicator */}
        {(params.type || params.category || params.subject || params.q) && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Active filters:</span>
            {params.q && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                Search: &quot;{params.q}&quot;
              </span>
            )}
            {params.type && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                {typeConfig[params.type]?.label || params.type}
              </span>
            )}
            {params.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                {categoryLabels[params.category] || params.category}
              </span>
            )}
            {params.subject && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                {(subjects.find((s: any) => s.slug === params.subject) as any)?.name || params.subject}
              </span>
            )}
            <Link
              href="/materials"
              className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto"
            >
              Clear all
            </Link>
          </div>
        )}
      </div>

      {/* Materials grid */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            {params.type || params.category || params.subject || params.q
              ? "No materials match your filters."
              : "No materials found yet."}
          </p>
          {(params.type || params.category || params.subject || params.q) && (
            <Link href="/materials" className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              Clear filters
            </Link>
          )}
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
                  <div className="aspect-video bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
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
                    <span className="flex items-center gap-1.5">
                      {material.uploadedBy?.name || "Unknown"}
                      {material.uploadedBy?.role === "teacher" ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold uppercase rounded-full border border-blue-200">Teacher</span>
                      ) : material.uploadedBy?.role === "student" ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase rounded-full border border-emerald-200">Student</span>
                      ) : null}
                    </span>
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

      {/* Disclaimer */}
      <div className="mt-10 bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <h3 className="font-semibold text-xs text-slate-600 mb-1.5">Disclaimer</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          The study materials available on GetMaterials are sourced from publicly available online resources, contributed by teachers, or shared by students from various colleges and educational institutions. We do not claim ownership of any material unless explicitly stated. If any college, university, or educational institution believes that certain materials should not be displayed on our platform, please{" "}
          <a href="https://getmaterials.in/contact" className="text-violet-600 hover:underline font-medium">contact us</a>{" "}
          and we will promptly remove or modify the content as requested.
        </p>
      </div>
    </div>
  );
}
