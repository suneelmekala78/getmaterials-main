import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { connectDB, Material } from "@/lib/database";
import { resolveThumbnailSrc } from "@/components/profile/FittedPhoto";

export const dynamic = "force-dynamic";

type HomeMaterial = {
  id: string;
  slug?: string;
  title: string;
  type?: string;
  thumbnailUrl?: string;
  subjectName?: string;
};

async function loadMaterials(): Promise<HomeMaterial[]> {
  try {
    await connectDB();
    const materials = await Material.find({
      status: "published",
      isPublic: true,
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .select("title slug type thumbnailUrl subject")
      .populate("subject", "name")
      .lean();
    return materials.map((m: any) => ({
      id: String(m._id),
      slug: m.slug || undefined,
      title: m.title,
      type: m.type,
      thumbnailUrl: m.thumbnailUrl || undefined,
      subjectName: m.subject?.name || undefined,
    }));
  } catch {
    return [];
  }
}

export default async function HomeMaterials() {
  const materials = await loadMaterials();
  if (!materials.length) return null;

  return (
    <section className="font-marketing relative overflow-hidden bg-white px-6 py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
              Materials
            </span>
            <h2 className="mt-4 text-[1.75rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2rem]">
              Latest materials
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
              Fresh notes, papers, and resources curated for students.
            </p>
          </div>
          <Link
            href="/materials"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline shrink-0"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => {
            const href = `/materials/${material.slug || material.id}`;
            const thumb = resolveThumbnailSrc(material.thumbnailUrl);
            return (
              <Link
                key={material.id}
                href={href}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-[#fafafa] transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {material.type ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-violet-700">
                        <FileText className="h-3 w-3" />
                        {material.type}
                      </span>
                    ) : null}
                    {material.subjectName ? (
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {material.subjectName}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 font-bold text-slate-900 group-hover:text-[var(--primary)]">
                    {material.title}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/materials"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            View all materials
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
