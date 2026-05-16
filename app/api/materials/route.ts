import { NextRequest, NextResponse } from "next/server";
import { connectDB, Material, Subject, Chapter } from "@getmaterials/database";
import { auth } from "@/lib/auth";
import { createMaterialSchema } from "@getmaterials/shared";
import { getCached, invalidateCache } from "@/lib/cache";
import { indexMaterial } from "@/lib/search";
import slugify from "slugify";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const chapter = searchParams.get("chapter");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const query: any = { status: "published", isPublic: true };
    if (subject) query.subject = subject;
    if (chapter) query.chapter = chapter;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const cacheKey = `materials:${JSON.stringify(query)}:${page}:${limit}`;
    const result = await getCached(
      cacheKey,
      async () => {
        const [materials, total] = await Promise.all([
          Material.find(query)
            .populate("subject", "name slug")
            .populate("chapter", "title slug")
            .populate("uploadedBy", "name avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          Material.countDocuments(query),
        ]);
        return { materials, total, pages: Math.ceil(total / limit) };
      },
      300 // 5 min cache
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get materials error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
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
      return NextResponse.json({ error: "Only teachers can upload materials" }, { status: 403 });
    }
    if (user.status !== "active") {
      return NextResponse.json({ error: "Your account is not active" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createMaterialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const slug = slugify(parsed.data.title, { lower: true, strict: true }) + "-" + nanoid(6);

    const material = await Material.create({
      ...parsed.data,
      slug,
      uploadedBy: user.id,
      attachments: body.attachments || [],
    });

    // Update counts
    await Promise.all([
      Subject.findByIdAndUpdate(parsed.data.subject, { $inc: { materialsCount: 1 } }),
      Chapter.findByIdAndUpdate(parsed.data.chapter, { $inc: { materialsCount: 1 } }),
    ]);

    // Index for search (non-blocking)
    const populatedMaterial: any = await Material.findById(material._id)
      .populate("subject", "name slug")
      .populate("chapter", "title")
      .populate("uploadedBy", "name")
      .lean();

    if (populatedMaterial) {
      indexMaterial({
        id: material._id.toString(),
        title: material.title,
        description: material.description || "",
        type: material.type,
        subjectName: (populatedMaterial.subject as any)?.name || "",
        subjectSlug: (populatedMaterial.subject as any)?.slug || "",
        chapterTitle: (populatedMaterial.chapter as any)?.title || "",
        tags: material.tags,
        uploadedByName: (populatedMaterial.uploadedBy as any)?.name || "",
        createdAt: material.createdAt.getTime(),
      }).catch(() => {});
    }

    // Invalidate caches
    invalidateCache("materials:*").catch(() => {});
    invalidateCache("subjects:*").catch(() => {});

    return NextResponse.json(
      { message: "Material uploaded successfully", material },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create material error:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}
