import type { Metadata } from "next";
import FeedbackForm from "@/components/marketing/FeedbackForm";
import { listingMetadata } from "@/lib/seo";

export const metadata: Metadata = listingMetadata({
  title: "Feedback — Help Us Improve GetMaterials",
  description:
    "Share your feedback about GetMaterials. Your suggestions help us improve the platform and serve students better. We read every message.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return (
    <main>
      <section className="bg-gradient-soft">
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-20 md:pb-24 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-3">Feedback</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5">
            Your voice <span className="text-[var(--primary)]">matters</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            We&apos;re always looking to improve. Tell us what you love, what you don&apos;t, and what we should build next.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="max-w-2xl mx-auto px-6">
          <FeedbackForm />
        </div>
      </section>
    </main>
  );
}
