import { NextRequest, NextResponse } from "next/server";
import { connectDB, Material, User } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

const HISTORY_LIMIT = 100;

async function pushViewHistory(userId: string, materialId: string) {
  await User.findByIdAndUpdate(userId, {
    $pull: { viewHistory: { material: materialId } },
  });
  await User.findByIdAndUpdate(userId, {
    $push: {
      viewHistory: {
        $each: [{ material: materialId, at: new Date() }],
        $position: 0,
        $slice: HISTORY_LIMIT,
      },
    },
  });
}

// GET /api/materials/[id]/view - Public endpoint to view a single material
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const material = await Material.findOne({
      _id: id,
      status: "published",
      isPublic: true,
    })
      .populate("subject", "name slug")
      .populate("chapter", "title slug")
      .populate("uploadedBy", "name avatar role")
      .lean();

    if (!material) {
      return NextResponse.json(
        { error: "Material not found" },
        { status: 404 }
      );
    }

    // Fetch related materials from the same chapter
    const related = await Material.find({
      chapter: (material as any).chapter?._id,
      _id: { $ne: (material as any)._id },
      status: "published",
      isPublic: true,
    })
      .populate("uploadedBy", "name role")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Increment views (non-blocking)
    Material.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    // Track per-user view history when authenticated
    const authUser = await getUser().catch(() => null);
    let isBookmarked = false;
    if (authUser?.id) {
      pushViewHistory(authUser.id, id).catch(() => {});
      const user = await User.findById(authUser.id).select("bookmarks").lean();
      isBookmarked = Boolean(
        (user as any)?.bookmarks?.some(
          (b: any) => b.toString() === id
        )
      );
    }

    return NextResponse.json({ material, related, isBookmarked });
  } catch (error) {
    console.error("View material error:", error);
    return NextResponse.json(
      { error: "Failed to fetch material" },
      { status: 500 }
    );
  }
}
