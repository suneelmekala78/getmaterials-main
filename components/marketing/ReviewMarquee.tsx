"use client";

import Image from "next/image";

export type ReviewItem = {
  name: string;
  role: string;
  handle: string;
  text: string;
  time: string;
  avatar: string;
};

type ReviewMarqueeProps = {
  reviews: ReviewItem[];
  direction: "up" | "down";
};

function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <article className="rounded-[22px] border border-[#f3e8ff] bg-white p-5 shadow-[0_10px_28px_rgba(177,0,255,0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <Image
          src={review.avatar}
          alt={review.name}
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full border-2 border-[#f3e8ff] object-cover"
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-[#111]">{review.name}</p>
          <p className="truncate text-[13px] text-slate-500">
            {review.role}{" "}
            <span className="text-[var(--primary)]">{review.handle}</span>
          </p>
        </div>
      </div>
      <p className="text-[14px] leading-[1.65] text-slate-600">{review.text}</p>
      <p className="mt-4 text-[12px] text-slate-400">{review.time}</p>
    </article>
  );
}

function MarqueeColumn({ reviews, direction }: ReviewMarqueeProps) {
  const loop = [...reviews, ...reviews];

  return (
    <div className="relative h-[620px] overflow-hidden sm:h-[680px]">
      <div
        className={`review-marquee-track flex flex-col gap-4 ${
          direction === "up" ? "review-marquee-up" : "review-marquee-down"
        }`}
      >
        {loop.map((review, index) => (
          <ReviewCard key={`${review.name}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewMarquee({
  left,
  center,
  right,
}: {
  left: ReviewItem[];
  center: ReviewItem[];
  right: ReviewItem[];
}) {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-[#fafafa] to-transparent sm:h-24" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-b from-transparent to-[#fafafa] sm:h-24" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        <div className="hidden md:block">
          <MarqueeColumn reviews={left} direction="up" />
        </div>
        <MarqueeColumn reviews={center} direction="down" />
        <div className="hidden md:block">
          <MarqueeColumn reviews={right} direction="up" />
        </div>
      </div>
    </div>
  );
}
