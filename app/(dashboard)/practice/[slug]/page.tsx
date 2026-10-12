import { Suspense } from "react";
import ProblemWorkspace from "@/components/practice/ProblemWorkspace";

export default async function PracticeProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-72 bg-slate-200 rounded animate-pulse" />
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="h-80 bg-white border border-slate-200 rounded-2xl animate-pulse" />
            <div className="h-80 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          </div>
        </div>
      }
    >
      <ProblemWorkspace slug={slug} />
    </Suspense>
  );
}
