import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, MaterialRequest, Subject } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET /api/requests - get user's material requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const requests = await MaterialRequest.find({ user: session.user.id })
      .populate("subject", "name")
      .populate("assignedTo", "name")
      .populate("comments.user", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("GET /api/requests error:", err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// POST /api/requests - create a new material request
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, subject } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }

    await connectDB();

    // Find subject by name, slug, or ObjectId
    const mongoose = await import("mongoose");
    const subjectQuery: any[] = [
      { name: { $regex: new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      { slug: subject.toLowerCase() },
    ];
    if (mongoose.Types.ObjectId.isValid(subject)) {
      subjectQuery.push({ _id: subject });
    }

    const subjectDoc = await Subject.findOne({ $or: subjectQuery });

    if (!subjectDoc) {
      return NextResponse.json({ error: "Subject not found" }, { status: 400 });
    }

    // Ensure description meets minlength (10 chars)
    const desc = description
      ? `${title} - ${description}`
      : title.length >= 10
        ? title
        : `${title} - Material request`;

    const materialRequest = await MaterialRequest.create({
      user: session.user.id,
      description: desc,
      subject: subjectDoc._id,
      status: "open",
    });

    return NextResponse.json({ message: "Request submitted", request: materialRequest });
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return NextResponse.json({ error: "Failed to create request. Please try again." }, { status: 500 });
  }
}

// PATCH /api/requests - re-open request or add comment
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, comment } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Request ID required" }, { status: 400 });
    }

    await connectDB();

    // Verify the request belongs to the user
    const existingRequest = await MaterialRequest.findOne({ _id: id, user: session.user.id });
    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updateData: any = {};

    // Students can only re-open fulfilled/closed requests
    if (status === "open" && (existingRequest.status === "fulfilled" || existingRequest.status === "closed")) {
      updateData.status = "open";
      updateData.assignedTo = null;
    }

    // Add comment
    if (comment && comment.trim()) {
      const commentData = {
        user: session.user.id,
        message: comment.trim(),
        createdAt: new Date(),
      };
      const updated = await MaterialRequest.findByIdAndUpdate(
        id,
        { ...updateData, $push: { comments: commentData } },
        { new: true }
      )
        .populate("subject", "name")
        .populate("assignedTo", "name")
        .populate("comments.user", "name role");

      return NextResponse.json({ request: updated });
    }

    if (Object.keys(updateData).length > 0) {
      const updated = await MaterialRequest.findByIdAndUpdate(id, updateData, { new: true })
        .populate("subject", "name")
        .populate("assignedTo", "name")
        .populate("comments.user", "name role");

      return NextResponse.json({ request: updated });
    }

    return NextResponse.json({ error: "No changes" }, { status: 400 });
  } catch (err) {
    console.error("PATCH /api/requests error:", err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
