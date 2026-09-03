import { LoginForm } from "@/components/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";
import Link from "next/link";

export const metadata = {
  title: "Log In - GetMaterials",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Log in"
      subtitle={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[var(--primary)] font-semibold hover:underline">
            Sign up free
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
