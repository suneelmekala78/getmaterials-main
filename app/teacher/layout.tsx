import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopbar } from "@/components/layout/AppTopbar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  if (user.role !== "teacher" && user.role !== "admin") {
    redirect("/dashboard");
  }

  if (user.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md text-center bg-white p-10 rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⏳</span>
          </div>
          <h1 className="text-xl font-bold mb-3">Account Pending Approval</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your teacher account is being reviewed by our admin team.
            You&apos;ll receive an email once your account is approved and you can
            start uploading materials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AppSidebar user={user} />
      <div className="flex-1 flex flex-col">
        <AppTopbar user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
