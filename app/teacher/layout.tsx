import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { connectDB, User } from "@/lib/database";

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

  let currentStatus = user.status;
  if (currentStatus === "pending") {
    await connectDB();
    const dbUser = await User.findById(user.id).select("status").lean();
    if (dbUser) {
      currentStatus = (dbUser as any).status;
    }
  }

  if (currentStatus === "pending") {
    redirect("/dashboard");
  }

  return <PublicChrome>{children}</PublicChrome>;
}
