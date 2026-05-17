import { NextRequest, NextResponse } from "next/server";
import { connectDB, Material } from "@getmaterials/database";

// POST /api/materials/[id]/download - increment download count
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    await Material.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

    return NextResponse.json({ message: "Download tracked" });
  } catch {
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 });
  }
}
