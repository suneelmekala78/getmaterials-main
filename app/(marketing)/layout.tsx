import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import Footer from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white">
      <MarketingNavbar />
      {children}
      <Footer />
    </div>
  );
}
