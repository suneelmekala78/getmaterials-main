import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listingMetadata } from "@/lib/seo";
import { connectDB, Job } from "@/lib/database";
import JobApplyForm from "@/components/marketing/JobApplyForm";

type Params = { params: Promise<{ slug: string }> };

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full time",
  part_time: "Part time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const job = await Job.findOne({ slug: slug.toLowerCase(), isActive: true })
    .select("title description company")
    .lean();
  if (!job) {
    return listingMetadata({
      title: "Job not found",
      description: "This career opening is no longer available.",
      path: `/careers/${slug}`,
    });
  }
  return listingMetadata({
    title: `${job.title} — Careers at ${job.company || "GetMaterials"}`,
    description: String(job.description || "").slice(0, 160) || `Apply for ${job.title}`,
    path: `/careers/${slug}`,
  });
}

export const dynamic = "force-dynamic";

export default async function CareerDetailPage({ params }: Params) {
  const { slug } = await params;
  await connectDB();
  const job = await Job.findOne({
    slug: slug.toLowerCase(),
    isActive: true,
  }).lean();
  if (!job) notFound();

  const j = job as any;

  return (
    <main>
      <section className="bg-gradient-soft">
        <div className="max-w-3xl mx-auto px-6 pt-16 pb-12 md:pt-20">
          <Link
            href="/careers"
            className="text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            ← All careers
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4 mb-3">{j.title}</h1>
          <p className="text-gray-500">
            {j.company || "GetMaterials"}
            {j.location ? ` · ${j.location}` : ""} ·{" "}
            {TYPE_LABELS[j.employmentType] || j.employmentType}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">About the role</h2>
            <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">
              {j.description || "No description provided."}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Apply</h2>
            {j.applyMode === "external" && j.externalUrl ? (
              <a
                href={j.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition"
              >
                Apply on external site
              </a>
            ) : (
              <JobApplyForm slug={j.slug} title={j.title} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
