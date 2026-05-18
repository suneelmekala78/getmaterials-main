import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "GetMaterials - Free Study Materials Platform",
    template: "%s | GetMaterials",
  },
  description: "Access free study materials, notes, question papers, videos, and resources uploaded by verified teachers. Download PDFs, watch video lectures, and excel in your exams.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://getmaterials.com"),
  icons: {
    icon: "/getmaterials.jpeg",
  },
  openGraph: {
    siteName: "GetMaterials",
    type: "website",
    images: ["/getmaterials.jpeg"],
  },
  twitter: {
    card: "summary",
    images: ["/getmaterials.jpeg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
