import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/lib/shared";

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7 fill-current">
      <path d="M16.37 12.55c-.03-2.34 1.91-3.46 2-3.51-1.09-1.6-2.79-1.82-3.39-1.84-1.44-.15-2.82.85-3.55.85-.74 0-1.87-.83-3.08-.8-1.58.02-3.04.92-3.86 2.34-1.65 2.86-.42 7.09 1.18 9.41.79 1.14 1.72 2.41 2.95 2.37 1.18-.05 1.63-.76 3.06-.76 1.43 0 1.83.76 3.08.73 1.27-.02 2.08-1.15 2.86-2.29.9-1.31 1.27-2.58 1.29-2.65-.03-.01-2.48-.95-2.51-3.85z" />
      <path d="M14.47 6.3c.65-.79 1.09-1.89.97-2.98-.94.04-2.08.63-2.75 1.41-.6.7-1.13 1.82-.99 2.89 1.05.08 2.12-.53 2.77-1.32z" />
    </svg>
  );
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-7 w-7">
      <path fill="#34A853" d="M3.5 20.4c.3.5.9.7 1.4.5l9.2-5.3-2.4-2.4-8.2 7.2z" />
      <path fill="#FBBC04" d="M16.8 13.6l-2.6-2.6 2.6-2.6 3.2 1.8c.8.5.8 1.6 0 2.1l-3.2 1.3z" />
      <path fill="#EA4335" d="M4.9 3.1C4.4 2.9 3.8 3.1 3.5 3.6l8.2 7.4 2.5-2.5L4.9 3.1z" />
      <path fill="#4285F4" d="M3.5 3.6v16.8l8.2-8.4L3.5 3.6z" />
    </svg>
  );
}

export function StoreBadges({
  className = "",
  tone = "onDark",
}: {
  className?: string;
  /** onDark = glass badges for black panels; onLight = solid dark badges for white pages */
  tone?: "onDark" | "onLight";
}) {
  const stores = [
    {
      href: GOOGLE_PLAY_URL,
      kicker: "Get it on",
      name: "Google Play",
      mark: <PlayMark />,
    },
    {
      href: APP_STORE_URL,
      kicker: "Download on the",
      name: "App Store",
      mark: <AppleMark />,
    },
  ];

  const badgeClass =
    tone === "onLight"
      ? "inline-flex min-w-[190px] items-center gap-3 rounded-xl bg-slate-950 px-4 py-2.5 text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
      : "inline-flex min-w-[190px] items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15";

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {stores.map((store) => (
        <a
          key={store.name}
          href={store.href}
          target="_blank"
          rel="noopener noreferrer"
          className={badgeClass}
        >
          {store.mark}
          <span className="text-left leading-tight">
            <span className="block text-[10px] font-medium uppercase tracking-wide text-white/70">
              {store.kicker}
            </span>
            <span className="block text-[15px] font-semibold">{store.name}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

export default function AppDownload() {
  return (
    <section
      id="get-the-app"
      className="font-marketing relative overflow-hidden bg-[#0a0a0a] px-6 py-14 sm:py-16"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 15% 20%, rgba(139,92,246,0.22), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 80%, rgba(59,130,246,0.14), transparent 50%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.15fr_auto] lg:gap-12">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-violet-300">
            Android and iPhone
          </p>
          <h2 className="mt-3 text-[1.8rem] font-bold leading-tight tracking-tight text-white sm:text-[2.15rem]">
            Get the GetMaterials app
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            Discover notes, quizzes, and polls on your phone. Free on Google Play and the App Store.
          </p>
        </div>
        <StoreBadges className="sm:flex-row" />
      </div>
    </section>
  );
}
