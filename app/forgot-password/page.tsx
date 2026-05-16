import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";

export const metadata = {
  title: "Forgot Password - GetMaterials",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-extrabold text-[1.6rem] text-[var(--primary)]">
            Get<span className="text-black">Materials</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-extrabold mb-2">Forgot password?</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          <ForgotPasswordForm />

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
