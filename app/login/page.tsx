import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export const metadata = {
  title: "Log In - GetMaterials",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-extrabold text-[1.6rem] text-[var(--primary)]">
            Get<span className="text-black">Materials</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-extrabold mb-2">Log in</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
              Sign up free
            </Link>
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
