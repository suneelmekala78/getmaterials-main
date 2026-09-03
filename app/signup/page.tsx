import { SignupForm } from "@/components/auth/SignupForm";
import { AuthShell } from "@/components/auth/AuthShell";
import Link from "next/link";

export const metadata = {
  title: "Sign Up - GetMaterials",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create account"
      subtitle={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
