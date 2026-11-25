import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { listingMetadata } from "@/lib/seo";
import { resolveApiOrigin } from "@/lib/api-origin";

export const metadata: Metadata = listingMetadata({
  title: "Programs & Courses — Browse by B.Tech, MBA, BCA & more",
  description:
    "Find study materials by program — B.Tech, MBA, MBBS, BCA, MCA, B.Com, and more on GetMaterials.",
  path: "/programs",
  keywords: [
    "B.Tech notes",
    "MBA study materials",
    "BCA materials",
    "college programs",
    "GetMaterials",
  ],
});

export const dynamic = "force-dynamic";

type Program = {
  key: string;
  label: string;
  durationYears?: number;
  totalSemesters?: number;
};

async function loadPrograms(): Promise<Program[]> {
  try {
    const res = await fetch(`${resolveApiOrigin()}/api/programs`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.programs || [];
  } catch {
    return [];
  }
}

export default async function ProgramsPage() {
  const programs = await loadPrograms();

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
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-14 pb-12 md:pt-16 md:pb-14 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-[0.18em] mb-3">
            Programs
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Browse by{" "}
            <span className="text-[var(--primary)]">course</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Jump straight into materials for your program — B.Tech, MBA, BCA,
            and more.
          </p>
        </div>
      </section>

      <section className="section !pt-8 !pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          {programs.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No programs listed yet</p>
              <Link
                href="/materials"
                className="inline-block mt-4 text-sm font-semibold text-violet-600 hover:underline"
              >
                Browse all materials
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((program) => (
                <Link
                  key={program.key}
                  href={`/materials?program=${encodeURIComponent(program.key)}`}
                  className="group flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-5 hover:border-violet-200 hover:shadow-md transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:bg-violet-100 transition">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-slate-900 group-hover:text-violet-700 transition">
                      {program.label}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {[
                        program.durationYears
                          ? `${program.durationYears} yr`
                          : null,
                        program.totalSemesters
                          ? `${program.totalSemesters} sem`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "View materials"}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 transition shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
