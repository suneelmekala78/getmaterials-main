import { PublicChrome } from "@/components/layout/PublicChrome";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicChrome>{children}</PublicChrome>;
}
