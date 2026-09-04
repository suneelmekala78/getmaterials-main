export type ImagePos = { x: number; y: number; zoom: number };

export const DEFAULT_IMAGE_POS: ImagePos = { x: 50, y: 50, zoom: 1 };

export function normalizePos(pos?: ImagePos | null): ImagePos {
  return {
    x: Math.min(100, Math.max(0, Number(pos?.x ?? 50))),
    y: Math.min(100, Math.max(0, Number(pos?.y ?? 50))),
    zoom: Math.min(3, Math.max(1, Number(pos?.zoom ?? 1))),
  };
}

export function FittedPhoto({
  src,
  pos,
  className = "",
  alt = "",
}: {
  src: string;
  pos?: ImagePos | null;
  className?: string;
  alt?: string;
}) {
  const p = normalizePos(pos);
  return (
    <div className={`overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        style={{
          objectPosition: `${p.x}% ${p.y}%`,
          transform: `scale(${p.zoom})`,
          transformOrigin: `${p.x}% ${p.y}%`,
        }}
      />
    </div>
  );
}

export function defaultAvatarSrc(role?: string) {
  return role === "teacher"
    ? "/images/default-teacher-pic.png"
    : "/images/default-profile-pic.png";
}

export function defaultBannerSrc() {
  return "/images/default-banner.png";
}

export function resolveAvatarSrc(image?: string | null, role?: string) {
  return image || defaultAvatarSrc(role);
}

export function defaultThumbnailSrc() {
  return "/images/default-thumbnail.png";
}

export function resolveThumbnailSrc(image?: string | null) {
  return image || defaultThumbnailSrc();
}
