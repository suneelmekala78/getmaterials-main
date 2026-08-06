import { NextRequest, NextResponse } from "next/server";
import { connectDB, Material, User } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

const HISTORY_LIMIT = 100;

async function pushUserHistory(
  userId: string,
  field: "downloadHistory" | "viewHistory",
  materialId: string
) {
  // Move material to front and keep a capped list
  await User.findByIdAndUpdate(userId, {
    $pull: { [field]: { material: materialId } },
  });
  await User.findByIdAndUpdate(userId, {
    $push: {
      [field]: {
        $each: [{ material: materialId, at: new Date() }],
        $position: 0,
        $slice: HISTORY_LIMIT,
      },
    },
  });
}

// POST /api/materials/[id]/download - increment download count
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const material = await Material.findByIdAndUpdate(id, {
      $inc: { downloads: 1 },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Track per-user download history when authenticated (web or mobile)
    const authUser = await getUser().catch(() => null);
    if (authUser?.id) {
      pushUserHistory(authUser.id, "downloadHistory", id).catch(() => {});
    }

    return NextResponse.json({ message: "Download tracked" });
  } catch {
    return NextResponse.json({ error: "Failed to track download" }, { status: 500 });
  }
}
