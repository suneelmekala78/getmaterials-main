import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";
import { Suspense } from "react";
import { ReferralTracker } from "@/components/providers/ReferralTracker";
import { GoogleAnalytics } from "@/components/providers/GoogleAnalytics";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

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
  description: "Access free study materials, notes, question papers, videos, and resources uploaded by verified teachers. Download PDFs, watch video lectures, and excel in your exams.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/getmaterials.jpeg",
    apple: "/getmaterials.jpeg",
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE.url],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "GetMaterials",
  url: "https://getmaterials.in",
  logo: "https://getmaterials.in/getmaterials.jpeg",
  description:
    "Free, community-driven platform where verified teachers share study materials and students access them without paying.",
  founder: {
    "@type": "Person",
    name: "Suneel Mekala",
  },
  sameAs: [
    "https://twitter.com/getmaterials_in",
    "https://instagram.com/getmaterials.in",
    "https://linkedin.com/company/getmaterials",
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
    <html lang="en">
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
