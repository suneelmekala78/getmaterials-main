import type { Metadata } from "next";
import type { ReactNode } from "react";
import { connectDB, Quiz } from "@/lib/database";
import { DEFAULT_QUIZ_IMAGE, listingMetadata, plainText } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = decodeURIComponent(slug || "").trim();
  await connectDB();
  const isId = /^[a-f0-9]{24}$/i.test(key);
  const quiz = await Quiz.findOne(
    isId ? { _id: key, isActive: true } : { slug: key.toLowerCase(), isActive: true },
  )
    .select("title description thumbnailUrl slug subject")
    .populate("subject", "name")
    .lean<{
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      slug?: string;
      subject?: { name?: string } | null;
    } | null>();

  if (!quiz?.title) {
    return listingMetadata({
      title: "Quiz",
      description: "Practice free quizzes on GetMaterials.",
      path: `/quizzes/${encodeURIComponent(key)}`,
      image: DEFAULT_QUIZ_IMAGE,
    });
  }

  const subjectName = quiz.subject?.name;
  const description =
    plainText(quiz.description) ||
    `Practice ${quiz.title}${subjectName ? ` — ${subjectName}` : ""} on GetMaterials.`;

  return listingMetadata({
    title: quiz.title,
    description,
    path: `/quizzes/${encodeURIComponent(quiz.slug || key)}`,
    keywords: [quiz.title, subjectName, "quiz", "practice quiz", "GetMaterials"].filter(
      Boolean,
    ) as string[],
    image: quiz.thumbnailUrl || DEFAULT_QUIZ_IMAGE,
    imageAlt: quiz.title,
  });
}

export default function QuizShareLayout({ children }: Props) {
  return children;
}
