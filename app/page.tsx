import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    const role = (session.user as any).role;
    if (role === "teacher") {
      redirect("/teacher/dashboard");
    }
    redirect("/dashboard");
  }

  redirect("/materials");
}
