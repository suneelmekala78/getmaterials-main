import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, Quiz, QuizAttempt } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET /api/quizzes?subject=xxx or ?chapter=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subject");
    const chapterId = searchParams.get("chapter");
    const quizId = searchParams.get("id");

    await connectDB();

    // Fetch a single quiz by ID (for quiz-taking)
    if (quizId) {
      const quiz = await Quiz.findById(quizId)
        .populate("subject", "name")
        .populate("chapter", "title")
        .lean();
      if (!quiz) {
        return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
      }
      return NextResponse.json({ quiz });
    }

    // List quizzes
    const filter: Record<string, unknown> = { isActive: true };
    if (subjectId) filter.subject = subjectId;
    if (chapterId) filter.chapter = chapterId;

    const quizzes = await Quiz.find(filter)
      .populate("subject", "name")
      .populate("chapter", "title")
      .select("title description subject chapter duration questions attempts")
      .sort({ createdAt: -1 })
      .lean();

    // Add question count without revealing answers
    const sanitized = quizzes.map((q: any) => ({
      ...q,
      questionCount: q.questions?.length || 0,
      questions: undefined,
    }));

    return NextResponse.json({ quizzes: sanitized });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

// POST /api/quizzes - submit quiz attempt
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quizId, answers } = await request.json();
    if (!quizId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Quiz ID and answers are required" }, { status: 400 });
    }

    await connectDB();

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    let correct = 0;
    const results = quiz.questions.map((q: { question: string; correctAnswer: number; explanation?: string }, i: number) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correct++;
      return {
        question: q.question,
        yourAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);

    // Save attempt
    await QuizAttempt.create({
      quiz: quizId,
      user: session.user.id,
      answers,
      score,
    });

    // Increment quiz attempts count
    await Quiz.findByIdAndUpdate(quizId, { $inc: { attempts: 1 } });

    return NextResponse.json({
      score,
      correct,
      total: quiz.questions.length,
      passed: score >= quiz.passingScore,
      results,
    });
  } catch {
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
