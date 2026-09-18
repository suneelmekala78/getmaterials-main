import Link from "next/link";
import { BadgeCheck, Star } from "lucide-react";
import {
  defaultAvatarSrc,
  defaultBannerSrc,
  FittedPhoto,
} from "@/components/profile/FittedPhoto";

export type TeacherCardData = {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  role?: string;
  avatar?: string;
  banner?: string;
  bannerPos?: { x: number; y: number; zoom: number };
  bio?: string;
  qualifications?: string;
  college?: { name?: string } | null;
  materials?: number;
  avgRating?: number;
};

export function TeacherCard({ teacher }: { teacher: TeacherCardData }) {
  const href = `/users/${teacher._id || teacher.id || teacher.slug}`;
  const rating = Number(teacher.avgRating || 0);
  const isTeacher = teacher.role === "teacher";

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-violet-200 hover:shadow-md transition-all"
    >
      <div className="relative h-28 bg-violet-100">
        <FittedPhoto
          src={teacher.banner || defaultBannerSrc()}
          pos={teacher.banner ? teacher.bannerPos : undefined}
          className="h-full w-full"
          alt=""
        />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={teacher.avatar || defaultAvatarSrc(isTeacher ? "teacher" : "student")}
          alt=""
          className="absolute -bottom-8 left-4 w-16 h-16 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
        />
      </div>
      <div className="pt-10 px-4 pb-4">
        <p className="font-bold text-slate-900 truncate inline-flex items-center gap-1.5">
          <span className="truncate">{teacher.name}</span>
          {isTeacher ? <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" /> : null}
        </p>
        <p className="text-xs text-slate-500 truncate">{teacher.college?.name || "GetMaterials"}</p>
        {(teacher.qualifications || teacher.bio) && (
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
            {teacher.qualifications || teacher.bio}
          </p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          <span>{teacher.materials || 0} materials</span>
          {rating > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
