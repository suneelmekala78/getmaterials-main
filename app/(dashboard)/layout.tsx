import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      <AppSidebar user={session.user as any} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppTopbar user={session.user as any} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
