import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { resolveUserSlug } from "@/lib/public-profile";

export const metadata = {
  title: "My Profile - GetMaterials",
};

export default async function OwnProfilePage() {
  const session = await auth();
  const id = (session?.user as any)?.id;
  if (!id) redirect("/login");
  const slug = (session?.user as any)?.slug || (await resolveUserSlug(id));
  redirect(`/users/${slug || id}`);
}
