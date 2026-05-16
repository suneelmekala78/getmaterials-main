import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, MaterialRequest } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET /api/teacher/requests - get all material requests
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const requests = await MaterialRequest.find()
      .populate("subject", "name")
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("GET /api/teacher/requests error:", err);
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

// PATCH /api/teacher/requests - update request status or take request
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status, comment } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Request ID required" }, { status: 400 });
    }

    await connectDB();

    const updateData: any = {};

    // If taking the request
    if (status === "in_progress") {
      updateData.status = "in_progress";
      updateData.assignedTo = session.user.id;
    } else if (status && ["open", "fulfilled", "closed"].includes(status)) {
      updateData.status = status;
      if (status === "open") {
        updateData.assignedTo = null;
      }
    }

    // Add comment if provided
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
        .populate("user", "name email")
        .populate("assignedTo", "name email")
        .populate("comments.user", "name role");

      if (!updated) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
      }
      return NextResponse.json({ request: updated });
    }

    const updated = await MaterialRequest.findByIdAndUpdate(id, updateData, { new: true })
      .populate("subject", "name")
      .populate("user", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.user", "name role");

    if (!updated) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: updated });
  } catch (err) {
    console.error("PATCH /api/teacher/requests error:", err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
