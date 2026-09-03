import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { AuthShell } from "@/components/auth/AuthShell";
import Link from "next/link";

export const metadata = {
  title: "Forgot Password - GetMaterials",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot password?"
      subtitle={
        <>
          Enter your email and we&apos;ll send you a 6-digit reset code.{" "}
          <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
            Back to login
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
