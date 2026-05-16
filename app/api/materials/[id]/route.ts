import { NextRequest, NextResponse } from "next/server";
import { connectDB, Material, Subject, Chapter } from "@getmaterials/database";
import { auth } from "@/lib/auth";

// Get single material (for edit page)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const material = await Material.findById(id)
      .populate("subject", "name")
      .populate("chapter", "title")
      .lean();

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if ((material as any).uploadedBy.toString() !== userId && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ material });
  } catch (error) {
    console.error("Get material error:", error);
    return NextResponse.json({ error: "Failed to fetch material" }, { status: 500 });
  }
}

// Update own material (teacher)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const { id } = await params;

    await connectDB();

    const material = await Material.findById(id);
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Only the uploader or admin can edit
    if (material.uploadedBy.toString() !== userId && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const allowedFields = [
      "title", "description", "type", "externalUrl", "fileUrl",
      "thumbnailUrl", "subject", "chapter", "college", "tags", "attachments",
    ];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    // If subject/chapter changed, update counts
    if (updates.subject && updates.subject !== material.subject.toString()) {
      await Subject.findByIdAndUpdate(material.subject, { $inc: { materialsCount: -1 } });
      await Subject.findByIdAndUpdate(updates.subject, { $inc: { materialsCount: 1 } });
    }
    if (updates.chapter && updates.chapter !== material.chapter.toString()) {
      await Chapter.findByIdAndUpdate(material.chapter, { $inc: { materialsCount: -1 } });
      await Chapter.findByIdAndUpdate(updates.chapter, { $inc: { materialsCount: 1 } });
    }

    const updated = await Material.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ message: "Material updated", material: updated });
  } catch (error) {
    console.error("Material update error:", error);
    return NextResponse.json({ error: "Failed to update material" }, { status: 500 });
  }
}

// Delete own material (teacher)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const { id } = await params;

    await connectDB();

    const material = await Material.findById(id);
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Only the uploader or admin can delete
    if (material.uploadedBy.toString() !== userId && role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Decrement counts
    await Subject.findByIdAndUpdate(material.subject, { $inc: { materialsCount: -1 } });
    await Chapter.findByIdAndUpdate(material.chapter, { $inc: { materialsCount: -1 } });

    await Material.findByIdAndDelete(id);

    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    console.error("Material delete error:", error);
    return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
  }
}
