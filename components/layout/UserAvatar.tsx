import { resolveAvatarSrc } from "@/components/profile/FittedPhoto";

export function UserAvatar({
  name,
  image,
  role,
  size = 32,
  className = "",
}: {
  name?: string | null;
  image?: string | null;
  role?: string | null;
  size?: number;
  className?: string;
}) {
  const src = resolveAvatarSrc(image, role || undefined);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-50 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name || "Profile"} className="h-full w-full object-cover" />
    </span>
  );
}
