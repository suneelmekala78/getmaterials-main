import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, Quiz, QuizAttempt } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET /api/teacher/quizzes/attempts?quizId=xxx - get attempts for a teacher's quiz
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID required" }, { status: 400 });
    }

    await connectDB();

    // Verify quiz belongs to this teacher
    const quiz = await Quiz.findOne({ _id: quizId, createdBy: session.user.id });
    if (!quiz && user.role !== "admin") {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const attempts = await QuizAttempt.find({ quiz: quizId })
      .populate("user", "name email avatar role")
      .sort({ completedAt: -1 })
      .lean();

    // Calculate stats
    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0
      ? Math.round(attempts.reduce((sum: number, a: any) => sum + a.score, 0) / totalAttempts)
      : 0;
    const passCount = attempts.filter((a: any) => a.score >= (quiz?.passingScore || 60)).length;

    return NextResponse.json({
      attempts,
      stats: {
        total: totalAttempts,
        avgScore,
        passCount,
        failCount: totalAttempts - passCount,
        passingScore: quiz?.passingScore || 60,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}
