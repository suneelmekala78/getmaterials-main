import type { Metadata } from "next";
import "./globals.css";
import { Poppins } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "GetMaterials - Study Materials Platform",
  description: "Access free study materials, notes, videos, and resources uploaded by verified teachers.",
  icons: {
    icon: "/getmaterials.jpeg",
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
      </body>
    </html>
  );
}
