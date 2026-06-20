import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Subjects from "@/components/marketing/Subjects";
import HowItWorks from "@/components/marketing/HowItWorks";
import ForTeachers from "@/components/marketing/ForTeachers";
import Testimonials from "@/components/marketing/Testimonials";
import CTA from "@/components/marketing/CTA";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "GetMaterials — Free Study Materials, Notes & Resources for Students",
  description:
    "Access thousands of free study materials, handwritten notes, video lectures and assignments. Curated by verified teachers for students across India. No signup required to browse.",
  keywords: [
    "free study materials",
    "student notes",
    "handwritten notes",
    "college materials",
    "online learning",
    "free education",
    "study resources India",
    "GetMaterials",
    "engineering notes",
    "B.Tech study materials",
  ],
  openGraph: {
    title: "GetMaterials — Free Study Materials for Students",
    description:
      "Thousands of free notes, guides, video lectures & assignments. Curated by teachers, built for students.",
    url: "https://getmaterials.in",
    siteName: "GetMaterials",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GetMaterials - Free Study Materials for Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetMaterials — Free Study Materials for Students",
    description:
      "Access thousands of free study materials curated by verified teachers.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://getmaterials.in",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GetMaterials",
  url: "https://getmaterials.in",
  description:
    "Free study materials, handwritten notes, video lectures and assignments curated by verified teachers for students across India.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://getmaterials.in/materials?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "teacher") {
      redirect("/teacher/dashboard");
    }
    redirect("/dashboard");
  }

  return (
    <div className="bg-white">
      <MarketingNavbar />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Hero />
        <Features />
        <Subjects />
        <HowItWorks />
        <ForTeachers />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
