import type { Metadata } from "next";
import Link from "next/link";
import { listingMetadata } from "@/lib/seo";
import { connectDB, Job } from "@/lib/database";

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

export default async function CareersPage() {
  await connectDB();
  const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 }).lean();

  return (
    <main>
      <section className="bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-24 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-3">
            Careers
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">
            Build the future of{" "}
            <span className="text-[var(--primary)]">free education</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            We&apos;re a small team shipping tools for students across India. Come
            help us grow GetMaterials.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
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
            jobs.map((job: any) => (
              <Link
                key={String(job._id)}
                href={`/careers/${job.slug}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-violet-200 hover:shadow-sm transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{job.title}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.company || "GetMaterials"}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                  </div>
                  <span className="inline-flex self-start text-xs font-semibold px-2.5 py-1 rounded-lg bg-[rgba(177,0,255,0.08)] text-[var(--primary)]">
                    {TYPE_LABELS[job.employmentType] || job.employmentType}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
