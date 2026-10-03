import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Building2, Users, Wallet, Briefcase } from "lucide-react";
import { listingMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { connectDB, Job, User } from "@/lib/database";
import { formatSalaryINR } from "@/lib/format-salary";
import JobApplyForm from "@/components/marketing/JobApplyForm";
import SaveJobButton from "@/components/marketing/SaveJobButton";
import { ShareButton } from "@/components/ShareButton";

type Params = { params: Promise<{ slug: string }> };

const TYPE_LABELS: Record<string, string> = {
  full_time: "Full time",
  part_time: "Part time",
  internship: "Internship",
  contract: "Contract",
  remote: "Remote",
};

const LOCATION_TYPE_LABELS: Record<string, string> = {
  onsite: "On-site",
  remote: "Remote",
  hybrid: "Hybrid",
};

const AUDIENCE_LABELS: Record<string, string> = {
  student: "Students",
  graduate: "Graduates",
  any: "Open to all",
};

function looksLikeHtml(text: string) {
  return /<[a-z][\s\S]*>/i.test(text);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const job = await Job.findOne({ slug: slug.toLowerCase(), isActive: true })
    .select("title description company companyLogoUrl")
    .lean();
  if (!job) {
    return listingMetadata({
      title: "Job not found",
      description: "This career opening is no longer available.",
      path: `/careers/${slug}`,
    });
  }
  const plain = String(job.description || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return listingMetadata({
    title: `${job.title} — Careers at ${job.company || "GetMaterials"}`,
    description: plain.slice(0, 160) || `Apply for ${job.title}`,
    path: `/careers/${slug}`,
    keywords: [job.title, job.company, "careers", "GetMaterials"].filter(Boolean) as string[],
    image: job.companyLogoUrl || "/images/default-banner.png",
    imageAlt: job.company || job.title,
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
  const description = String(j.description || "");
  const isHtml = looksLikeHtml(description);
  const locationType = j.locationType || "onsite";
  const audience = j.audience || "any";
  const salaryDisplay = formatSalaryINR(j.salaryText);

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  let initialSaved = false;
  if (userId) {
    const u = await User.findById(userId).select("savedJobs").lean();
    initialSaved = ((u as any)?.savedJobs || []).some(
      (id: any) => String(id) === String(j._id),
    );
  }

  const pageUrl = `https://getmaterials.in/careers/${j.slug}`;
  const typeLabel = TYPE_LABELS[j.employmentType] || j.employmentType;
  const locationLabel = LOCATION_TYPE_LABELS[locationType];
  const audienceLabel = AUDIENCE_LABELS[audience];

  return (
    <main className="font-marketing">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #faf5ff 0%, #f8fafc 45%, #eef2ff 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 15% 20%, rgba(177,0,255,0.14), transparent), radial-gradient(ellipse 40% 40% at 85% 70%, rgba(99,102,241,0.1), transparent)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-10 pb-10 md:pt-12 md:pb-12">
          <Link
            href="/careers"
            className="text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            ← All careers
          </Link>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-white/80 bg-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
              {j.companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={j.companyLogoUrl}
                  alt=""
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-2xl font-extrabold text-[var(--primary)]">
                  {(j.company || "G").charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                {j.title}
              </h1>
              <p className="mt-2 text-slate-600 font-medium text-lg">
                {j.company || "GetMaterials"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-violet-100 text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-violet-500" />
                  {typeLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-violet-100 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-violet-500" />
                  {locationLabel}
                  {j.location ? ` · ${j.location}` : ""}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 border border-violet-100 text-slate-700">
                  <Users className="w-3.5 h-3.5 text-violet-500" />
                  {audienceLabel}
                </span>
                {salaryDisplay ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
                    <Wallet className="w-3.5 h-3.5" />
                    {salaryDisplay}
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <ShareButton
                  title={j.title}
                  description={`Join ${j.company || "GetMaterials"} — ${j.title}`}
                  url={pageUrl}
                />
                <SaveJobButton slug={j.slug} initialSaved={initialSaved} />
                {j.applyMode === "external" && j.externalUrl ? (
                  <a
                    href={j.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition"
                  >
                    Apply externally
                  </a>
                ) : (
                  <a
                    href="#apply"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition"
                  >
                    Apply now
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section !pt-8 !pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">About the role</h2>
              {isHtml ? (
                <div
                  className="material-description prose prose-sm max-w-none text-gray-700 break-words [&_*]:max-w-full [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-violet-600"
                  dangerouslySetInnerHTML={{
                    __html: description || "<p>No description provided.</p>",
                  }}
                />
              ) : (
                <div className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {description || "No description provided."}
                </div>
              )}
            </div>
          </div>

          <aside className="xl:col-span-5">
            <div className="xl:sticky xl:top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Key facts</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3 text-sm">
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                    <Building2 className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Company
                      </dt>
                      <dd className="text-slate-800 font-medium mt-0.5">
                        {j.company || "GetMaterials"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                    <MapPin className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Location
                      </dt>
                      <dd className="text-slate-800 font-medium mt-0.5">
                        {locationLabel}
                        {j.location ? ` · ${j.location}` : ""}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3">
                    <Users className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Who can apply
                      </dt>
                      <dd className="text-slate-800 font-medium mt-0.5">{audienceLabel}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-emerald-50/80 px-3.5 py-3 sm:col-span-2 xl:col-span-1">
                    <Wallet className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/70">
                        Salary / stipend
                      </dt>
                      <dd className="text-emerald-900 font-bold mt-0.5 text-base">
                        {salaryDisplay || "Not specified"}
                      </dd>
                    </div>
                  </div>
                </dl>
                <div className="pt-4 flex flex-wrap gap-2">
                  <ShareButton
                    title={j.title}
                    description={`Join ${j.company || "GetMaterials"} — ${j.title}`}
                    url={pageUrl}
                  />
                  <SaveJobButton slug={j.slug} initialSaved={initialSaved} />
                </div>
              </div>

              <div
                id="apply"
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 scroll-mt-28"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-5">Apply</h2>
                {j.applyMode === "external" && j.externalUrl ? (
                  <a
                    href={j.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition"
                  >
                    Apply on external site
                  </a>
                ) : (
                  <JobApplyForm slug={j.slug} title={j.title} />
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
