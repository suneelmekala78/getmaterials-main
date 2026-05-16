import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, Poll } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET /api/polls - get active polls the user hasn't responded to
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const polls = await Poll.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out polls the user already responded to
    const unanswered = polls.filter(
      (poll: any) => !poll.responses?.some((r: any) => r.user?.toString() === session.user?.id)
    ).map((poll: any) => ({
      _id: poll._id,
      question: poll.question,
      description: poll.description,
      type: poll.type,
      options: poll.options,
      createdAt: poll.createdAt,
    }));

    return NextResponse.json({ polls: unanswered });
  } catch {
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

// POST /api/polls - respond to a poll
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pollId, answer } = await req.json();

    if (!pollId || !answer) {
      return NextResponse.json({ error: "Poll ID and answer required" }, { status: 400 });
    }

    await connectDB();

    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isActive) {
      return NextResponse.json({ error: "Poll not found or inactive" }, { status: 404 });
    }

    // Check if already responded
    const alreadyResponded = poll.responses.some(
      (r: any) => r.user?.toString() === session.user?.id
    );
    if (alreadyResponded) {
      return NextResponse.json({ error: "Already responded" }, { status: 400 });
    }

    poll.responses.push({
      user: session.user?.id,
      answer,
      createdAt: new Date(),
    });
    await poll.save();

    return NextResponse.json({ message: "Response recorded. Thank you!" });
  } catch {
    return NextResponse.json({ error: "Failed to submit response" }, { status: 500 });
  }
}
