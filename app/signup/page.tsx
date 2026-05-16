import { SignupForm } from "@/components/auth/SignupForm";
import Link from "next/link";

export const metadata = {
  title: "Sign Up - GetMaterials",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-extrabold text-[1.6rem] text-[var(--primary)]">
            Get<span className="text-black">Materials</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-extrabold mb-2">Create account</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
              Log in
            </Link>
          </p>

          <SignupForm />
        </div>
      </div>
    </div>
  );
}
