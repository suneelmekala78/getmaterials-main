import { NextRequest, NextResponse } from "next/server";
import { connectDB, Chapter, Subject } from "@getmaterials/database";
import { auth } from "@/lib/auth";
import { createChapterSchema } from "@getmaterials/shared";
import slugify from "slugify";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subject");

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID required" }, { status: 400 });
    }

    await connectDB();

    const chapters = await Chapter.find({ subject: subjectId })
      .select("title slug order")
      .sort({ order: 1 })
      .lean();

    return NextResponse.json({ chapters });
  } catch {
    return NextResponse.json({ error: "Failed to fetch chapters" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "teacher" && user.role !== "admin") {
      return NextResponse.json({ error: "Only teachers and admins can add chapters" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createChapterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify subject exists
    const subject = await Subject.findById(parsed.data.subject);
    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const slug = slugify(parsed.data.title, { lower: true, strict: true }) + "-" + nanoid(4);

    // Check for duplicate chapter in same subject
    const existing = await Chapter.findOne({
      subject: parsed.data.subject,
      title: { $regex: new RegExp(`^${parsed.data.title}$`, "i") },
    });
    if (existing) {
      return NextResponse.json({ error: "A chapter with this title already exists in this subject" }, { status: 409 });
    }

    // Auto-assign order if not provided
    const order = parsed.data.order ?? (await Chapter.countDocuments({ subject: parsed.data.subject }));

    const chapter = await Chapter.create({
      ...parsed.data,
      slug,
      order,
      createdBy: user.id,
    });

    return NextResponse.json(
      { message: "Chapter created successfully", chapter },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
