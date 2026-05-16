import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-6xl font-extrabold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-700 mb-3">Page not found</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:-translate-y-0.5 transition-all shadow-[0_6px_18px_rgba(177,0,255,0.12)]"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg text-sm hover:bg-slate-50 transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
