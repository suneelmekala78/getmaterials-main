import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookmarkCheck, MapPin, Wallet } from "lucide-react";
import { listingMetadata } from "@/lib/seo";
import { auth } from "@/lib/auth";
import { connectDB, Job, User } from "@/lib/database";
import { formatSalaryINR } from "@/lib/format-salary";

export const metadata: Metadata = listingMetadata({
  title: "Careers — Join GetMaterials",
  description:
    "Explore open roles at GetMaterials. Help us make quality education free and accessible for every student.",
  path: "/careers",
  keywords: ["GetMaterials careers", "jobs", "internship", "hiring"],
});

export const dynamic = "force-dynamic";

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

export default async function CareersPage() {
  await connectDB();
  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).lean();

  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  let savedIds = new Set<string>();
  if (userId) {
    const u = await User.findById(userId).select("savedJobs").lean();
    savedIds = new Set(
      ((u as any)?.savedJobs || []).map((id: any) => String(id)),
    );
  }

  return (
    <main className="font-marketing">
      <section className="relative overflow-hidden bg-gradient-soft">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(177,0,255,0.12), transparent), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(99,102,241,0.1), transparent)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-14 pb-16 md:pt-16 md:pb-20 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-[0.18em] mb-3">
            Careers
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Build the future of{" "}
            <span className="text-[var(--primary)]">free education</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            We&apos;re a small team shipping tools for students across India. Come
            help us grow GetMaterials.
          </p>
        </div>
      </section>

      <section className="section !pt-10 !pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
              <p className="font-semibold text-slate-900">No open roles right now</p>
              <p className="text-sm text-gray-500 mt-2">
                Check back soon, or{" "}
                <Link href="/contact" className="text-[var(--primary)] font-medium">
                  get in touch
                </Link>{" "}
                if you&apos;d like to collaborate.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-500">
                {jobs.length} open {jobs.length === 1 ? "role" : "roles"}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {jobs.map((job: any) => {
                  const isSaved = savedIds.has(String(job._id));
                  const logo = job.companyLogoUrl;
                  const locationType = job.locationType || "onsite";
                  const salaryDisplay = formatSalaryINR(job.salaryText);
                  return (
                    <Link
                      key={String(job._id)}
                      href={`/careers/${job.slug}`}
                      className="group flex gap-4 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/50 transition"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logo}
                            alt=""
                            className="w-full h-full object-contain p-1.5"
                          />
                        ) : (
                          <span className="text-lg font-bold text-[var(--primary)]">
                            {(job.company || "G").charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[var(--primary)] transition line-clamp-2">
                            {job.title}
                          </h2>
                          {isSaved ? (
                            <span title="Saved" className="text-[var(--primary)] shrink-0">
                              <BookmarkCheck className="w-4 h-4" />
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-500 mt-1.5">
                          {job.company || "GetMaterials"}
                          {job.location ? (
                            <span className="inline-flex items-center gap-1 ml-1">
                              · <MapPin className="w-3 h-3" /> {job.location}
                            </span>
                          ) : null}
                        </p>
                        {salaryDisplay ? (
                          <p className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                            <Wallet className="w-4 h-4" />
                            {salaryDisplay}
                          </p>
                        ) : (
                          <p className="mt-2.5 text-sm text-slate-400">Salary not specified</p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[rgba(177,0,255,0.08)] text-[var(--primary)]">
                            {TYPE_LABELS[job.employmentType] || job.employmentType}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
                            {LOCATION_TYPE_LABELS[locationType] || locationType}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">
                            {AUDIENCE_LABELS[job.audience || "any"]}
                          </span>
                          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition">
                            View role <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
