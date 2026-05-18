import { auth } from "@/lib/auth";
import { MobileShell } from "@/components/layout/MobileShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If user is logged in, show full shell with sidebar
  if (session?.user) {
    return (
      <MobileShell user={session.user as any}>
        {children}
      </MobileShell>
    );
  }

  // Guest users (browsing materials/subjects without login)
  return (
    <MobileShell user={{ name: "Guest", role: "student" }}>
      {children}
    </MobileShell>
  );
}
