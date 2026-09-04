"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import MaterialCard from "@/components/materials/MaterialCard";
import QuizCard, { type QuizCardData } from "@/components/quizzes/QuizCard";
import { resolveAvatarSrc } from "@/components/profile/FittedPhoto";

type Tab = "materials" | "quizzes" | "reviews";

export type ProfileReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; avatar?: string; role?: string };
  material?: { title: string; slug?: string } | null;
};

export function ProfileLibrary({
  materials,
  quizzes,
  reviews,
  bookmarkSet,
  loggedIn,
}: {
  materials: any[];
  quizzes: QuizCardData[];
  reviews: ProfileReview[];
  bookmarkSet: string[];
  loggedIn: boolean;
}) {
  const bookmarks = useMemo(() => new Set(bookmarkSet), [bookmarkSet]);
  const [tab, setTab] = useState<Tab>("materials");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState("latest");

  const materialSubjects = useMemo(() => {
    return [...new Set(materials.map((item) => item.subject?.name).filter(Boolean))] as string[];
  }, [materials]);
  const quizSubjects = useMemo(() => {
    return [...new Set(quizzes.map((item) => item.subject).filter(Boolean))] as string[];
  }, [quizzes]);

  const filteredMaterials = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = materials.filter((item) => {
      if (type !== "all" && item.type !== type) return false;
      if (subject !== "all" && item.subject?.name !== subject) return false;
      if (q && !String(item.title || "").toLowerCase().includes(q)) return false;
      return true;
    });
    next.sort((a, b) => {
      if (sort === "downloads") return (b.downloads || 0) - (a.downloads || 0);
      if (sort === "rating") return (b.rating?.average || 0) - (a.rating?.average || 0);
      if (sort === "views") return (b.views || 0) - (a.views || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return next;
  }, [materials, query, type, subject, sort]);

  const filteredQuizzes = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = quizzes.filter((item) => {
      if (subject !== "all" && item.subject !== subject) return false;
      if (q && !item.title.toLowerCase().includes(q) && !String(item.description || "").toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    if (sort === "attempts") {
      next.sort((a, b) => (b.attempts || 0) - (a.attempts || 0));
    }
    return next;
  }, [quizzes, query, subject, sort]);

  const filteredReviews = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = reviews.filter((item) => {
      if (q && !item.comment.toLowerCase().includes(q) && !item.material?.title?.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
    next.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return next;
  }, [reviews, query, sort]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "materials", label: "Materials", count: materials.length },
    { id: "quizzes", label: "Quizzes", count: quizzes.length },
    { id: "reviews", label: "Reviews", count: reviews.length },
  ];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 mb-4">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setQuery("");
              setType("all");
              setSubject("all");
              setSort("latest");
            }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${
              tab === item.id
                ? "bg-[var(--primary)] text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            tab === "reviews" ? "Search reviews..." : tab === "quizzes" ? "Search quizzes..." : "Search materials..."
          }
          className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500"
        />
        {tab === "materials" ? (
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
          >
            <option value="all">All types</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
            <option value="image">Image</option>
            <option value="assignment">Assignment</option>
          </select>
        ) : null}
        {tab !== "reviews" ? (
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
          >
            <option value="all">All subjects</option>
            {(tab === "quizzes" ? quizSubjects : materialSubjects).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        ) : null}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="latest">Latest</option>
          {tab === "materials" ? (
            <>
              <option value="downloads">Most downloaded</option>
              <option value="views">Most viewed</option>
              <option value="rating">Highest rated</option>
            </>
          ) : null}
          {tab === "quizzes" ? <option value="attempts">Most attempted</option> : null}
          {tab === "reviews" ? <option value="rating">Highest rated</option> : null}
        </select>
      </div>

      {tab === "materials" ? (
        filteredMaterials.length === 0 ? (
          <p className="text-sm text-slate-500">No materials match these filters.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={String(material._id)}
                material={material}
                view="grid"
                bookmarked={bookmarks.has(String(material._id))}
                loggedIn={loggedIn}
              />
            ))}
          </div>
        )
      ) : null}

      {tab === "quizzes" ? (
        filteredQuizzes.length === 0 ? (
          <p className="text-sm text-slate-500">No quizzes match these filters.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} view="grid" />
            ))}
          </div>
        )
      ) : null}

      {tab === "reviews" ? (
        filteredReviews.length === 0 ? (
          <p className="text-sm text-slate-500">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAvatarSrc(review.user.avatar, review.user.role)}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{review.user.name}</p>
                      <span className="inline-flex items-center gap-0.5 text-amber-500 text-sm font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    {review.material?.slug ? (
                      <Link
                        href={`/materials/${review.material.slug}`}
                        className="text-xs font-semibold text-violet-600 hover:underline"
                      >
                        {review.material.title}
                      </Link>
                    ) : review.material?.title ? (
                      <p className="text-xs text-slate-500">{review.material.title}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : null}
    </section>
  );
}
