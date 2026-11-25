import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import Footer from "@/components/marketing/Footer";
import AppDownload from "@/components/marketing/AppDownload";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <MarketingNavbar />
      {children}
      <AppDownload />
      <Footer />
    </div>
  );
}
