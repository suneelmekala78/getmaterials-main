import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { ReferralTracker } from "@/components/providers/ReferralTracker";
import { GoogleAnalytics } from "@/components/providers/GoogleAnalytics";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "GetMaterials — Free Study Materials, Notes & Resources for Students",
    template: "%s | GetMaterials",
  },
  description:
    "Free study materials, notes, question papers, quizzes, and polls from verified teachers. Browse by subject or college — built for students across India.",
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: "GetMaterials", url: SITE_URL }],
  creator: "GetMaterials",
  publisher: "GetMaterials",
  category: "education",
  keywords: [
    "free study materials",
    "student notes",
    "handwritten notes",
    "college materials",
    "question papers",
    "quizzes for students",
    "study resources India",
    "GetMaterials",
    "engineering notes",
    "B.Tech study materials",
  ],
  icons: {
    icon: "/getmaterials.jpeg",
    apple: "/getmaterials.jpeg",
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    title: "GetMaterials — Free Study Materials for Students",
    description:
      "Free notes, PDFs, quizzes, and polls curated by verified teachers for students and colleges.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "GetMaterials — Free Study Materials for Students",
    description:
      "Access free study materials, quizzes, and polls curated by verified teachers.",
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "GetMaterials",
  url: SITE_URL,
  logo: absoluteUrl("/getmaterials.jpeg"),
  description:
    "Free, community-driven platform where verified teachers share study materials and students access notes, quizzes, and polls without paying.",
  founder: {
    "@type": "Person",
    name: "Suneel Mekala",
  },
  sameAs: [
    "https://x.com/getmaterials",
    "https://instagram.com/getmaterials.in",
    "https://linkedin.com/company/getmaterials",
    "https://youtube.com/@GetMaterials",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free study materials for students",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${poppins.variable} antialiased`}>
        <GoogleAnalytics />
        <AuthProvider>
          {children}
          <Suspense fallback={null}>
            <ReferralTracker />
          </Suspense>
        </AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
