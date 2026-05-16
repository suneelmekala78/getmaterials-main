import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";
import { Suspense } from "react";

export const metadata = {
  title: "Reset Password - GetMaterials",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-extrabold text-[1.6rem] text-[var(--primary)]">
            Get<span className="text-black">Materials</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-extrabold mb-2">Set new password</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Choose a strong password for your account.
          </p>

          <Suspense fallback={<div className="animate-pulse h-40 bg-gray-100 rounded-xl" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
