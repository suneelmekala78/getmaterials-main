import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, CollegeAssignment } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET - list assignments (optionally filtered by college/subject)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("college");
    const subjectId = searchParams.get("subject");

    await connectDB();

    const query: Record<string, any> = {};
    if (collegeId) query.college = collegeId;
    if (subjectId) query.subject = subjectId;

    const assignments = await CollegeAssignment.find(query)
      .populate("college", "name code")
      .populate("subject", "name")
      .populate("chapter", "title")
      .sort({ college: 1, semester: 1 })
      .limit(500)
      .lean();

    return NextResponse.json({ assignments });
  } catch {
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

// POST - create assignment (any authenticated user can create)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { college, subject, chapter, semester, unit, program, branch, batchStart, batchEnd } = body;

    if (!college || !subject || !semester || !batchStart || !batchEnd) {
      return NextResponse.json(
        { error: "College, subject, semester, batch start and batch end are required" },
        { status: 400 }
      );
    }

    if (batchStart > batchEnd) {
      return NextResponse.json({ error: "Batch start year must be before end year" }, { status: 400 });
    }

    await connectDB();

    const assignment = await CollegeAssignment.create({
      college,
      subject,
      chapter: chapter || undefined,
      semester,
      unit: unit || undefined,
      program: program || "btech",
      branch: branch?.trim() || undefined,
      batchStart,
      batchEnd,
      createdBy: (session.user as any).id,
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "This assignment already exists for the same college/subject/semester/batch" },
        { status: 409 }
      );
    }
    console.error("Create assignment error:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

// PATCH - update (admin or creator only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    await connectDB();

    const assignment = await CollegeAssignment.findById(id);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const user = session.user as any;
    if (assignment.createdBy?.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await CollegeAssignment.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json({ message: "Updated", assignment: updated });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: "Duplicate assignment" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE - admin or creator only
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await connectDB();

    const assignment = await CollegeAssignment.findById(id);
    if (!assignment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const user = session.user as any;
    if (assignment.createdBy?.toString() !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await CollegeAssignment.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
