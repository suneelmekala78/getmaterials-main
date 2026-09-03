import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { Suspense } from "react";

export const metadata = {
  title: "Reset Password - GetMaterials",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set new password"
      subtitle="Enter the code from your email and choose a strong password."
    >
      <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded-xl" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
