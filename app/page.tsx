import type { Metadata } from "next";
import Hero from "@/components/marketing/Hero";
import PlatformShowcase from "@/components/marketing/PlatformShowcase";
import MissionStory from "@/components/marketing/MissionStory";
import CoreValues from "@/components/marketing/CoreValues";
import Features from "@/components/marketing/Features";
import Subjects from "@/components/marketing/Subjects";
import HomePractice from "@/components/marketing/HomePractice";
import HomeMaterials from "@/components/marketing/HomeMaterials";
import HowItWorks from "@/components/marketing/HowItWorks";
import ForTeachers from "@/components/marketing/ForTeachers";
import Testimonials from "@/components/marketing/Testimonials";
import CTA from "@/components/marketing/CTA";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import Footer from "@/components/marketing/Footer";

export const metadata: Metadata = {
  title: "GetMaterials — Free Study Materials, Notes & Resources for Students",
  description:
    "Access free study materials, handwritten notes, question papers, quizzes, and polls. Curated by verified teachers for students and colleges across India.",
  keywords: [
    "free study materials",
    "student notes",
    "handwritten notes",
    "college materials",
    "question papers",
    "quizzes for students",
    "polls for students",
    "study resources India",
    "GetMaterials",
    "engineering notes",
    "B.Tech study materials",
  ],
  openGraph: {
    title: "GetMaterials — Free Study Materials for Students",
    description:
      "Free notes, PDFs, quizzes, and polls curated by teachers — built for students, not paid courses.",
    url: "https://getmaterials.in",
    siteName: "GetMaterials",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/images/hero.png",
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
      "Access free study materials, quizzes, and polls curated by verified teachers.",
    images: ["/images/hero.png"],
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
    "Free study materials, notes, quizzes, and polls curated by verified teachers for students across India.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://getmaterials.in/materials?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  return (
    <div className="bg-white">
      <MarketingNavbar />
      <main className="relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Hero />
        <PlatformShowcase />
        <MissionStory />
        <CoreValues />
        <Features />
        <Subjects />
        <HomeMaterials />
        <HomePractice />
        <HowItWorks />
        <ForTeachers />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
