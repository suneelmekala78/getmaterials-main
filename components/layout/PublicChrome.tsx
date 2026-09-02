import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import Footer from "@/components/marketing/Footer";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MarketingNavbar />
      <main className="flex-1 bg-[#fafafa]">
        <div className="px-4 sm:px-6 py-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
