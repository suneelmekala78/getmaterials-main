import { NextRequest, NextResponse } from "next/server";
import { connectDB, Subject } from "@getmaterials/database";
import { getCached, invalidateCache } from "@/lib/cache";
import { auth } from "@/lib/auth";
import { createSubjectSchema } from "@getmaterials/shared";
import slugify from "slugify";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const cacheKey = `subjects:${category || "all"}`;
    const subjects = await getCached(
      cacheKey,
      async () => {
        const query: any = { isActive: true };
        if (category) query.category = category;
        return Subject.find(query).sort({ name: 1 }).lean();
      },
      600 // 10 min cache
    );

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Get subjects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
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
      return NextResponse.json({ error: "Only teachers and admins can add subjects" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = slugify(parsed.data.name, { lower: true, strict: true }) + "-" + nanoid(4);

    // Check if subject with same name exists
    const existing = await Subject.findOne({ name: { $regex: new RegExp(`^${parsed.data.name}$`, "i") } });
    if (existing) {
      return NextResponse.json({ error: "A subject with this name already exists" }, { status: 409 });
    }

    const subject = await Subject.create({
      ...parsed.data,
      slug,
      createdBy: user.id,
    });

    invalidateCache("subjects:*").catch(() => {});

    return NextResponse.json(
      { message: "Subject created successfully", subject },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create subject error:", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
