import Link from "next/link";
import { ArrowRight, Building2, Star } from "lucide-react";
import { formatCount } from "./query";

const covers = [
  "from-indigo-600 to-violet-700",
  "from-blue-600 to-cyan-600",
  "from-violet-600 to-fuchsia-600",
  "from-slate-700 to-indigo-800",
  "from-emerald-600 to-teal-700",
];

export type CollegeCardData = {
  id: string;
  name: string;
  code: string;
  logo?: string;
  banner?: string;
  location?: string;
  materials: number;
  avgRating: number;
  branches: { name: string; count: number }[];
};

function CollegeLogo({
  college,
  className,
}: {
  college: CollegeCardData;
  className?: string;
}) {
  return (
    <div
      className={`bg-white flex items-center justify-center overflow-hidden ${className ?? ""}`}
    >
      {college.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={college.logo}
          alt={`${college.name} logo`}
          className="max-w-[88%] max-h-[88%] object-contain"
        />
      ) : (
        <span className="text-sm font-extrabold text-violet-700">
          {college.code.slice(0, 3)}
        </span>
      )}
    </div>
  );
}

function materialsLabel(count: number) {
  return `${formatCount(count)} ${count === 1 ? "material" : "materials"}`;
}

export default function CollegeCard({
  college,
  view,
}: {
  college: CollegeCardData;
  view: "grid" | "list";
}) {
  const cover = covers[college.name.length % covers.length];
  const exploreHref = `/materials?college=${encodeURIComponent(college.code)}`;

  if (view === "list") {
    return (
      <Link
        href={exploreHref}
        className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 hover:border-violet-200 hover:shadow-sm transition-all"
      >
        <CollegeLogo
          college={college}
          className="w-16 h-16 rounded-2xl border border-slate-100 shadow-sm shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 truncate">{college.name}</h3>
          <p className="text-xs text-slate-500 truncate">
            {college.code}
            {college.location ? ` • ${college.location}` : ""}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            {college.avgRating > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {college.avgRating.toFixed(1)}
              </span>
            )}
            <span>{materialsLabel(college.materials)}</span>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold">
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={exploreHref}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col hover:border-violet-200 hover:shadow-md transition-all"
    >
      <div className={`relative h-36 bg-gradient-to-br ${cover}`}>
        {college.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={college.banner} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Building2 className="absolute right-3 bottom-10 w-10 h-10 text-white/20" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent" />
        <CollegeLogo
          college={college}
          className="absolute -bottom-8 left-4 w-[4.75rem] h-[4.75rem] rounded-2xl border border-white shadow-md"
        />
      </div>
      <div className="pt-11 px-4 pb-4 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{college.name}</h3>
        <p className="text-xs text-slate-500 mt-1 truncate">
          {college.code}
          {college.location ? ` • ${college.location}` : ""}
        </p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
          {college.avgRating > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {college.avgRating.toFixed(1)}
            </span>
          )}
          <span>{materialsLabel(college.materials)}</span>
        </div>
        <span className="mt-4 inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold group-hover:opacity-90 transition-opacity">
          Explore materials
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
