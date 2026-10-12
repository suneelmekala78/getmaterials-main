import { Suspense } from "react";
import { StudySetup } from "@/components/study/StudySetup";

export const metadata = {
  title: "Set up your studies",
};

export default function WelcomePage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
      <StudySetup />
    </Suspense>
  );
}
