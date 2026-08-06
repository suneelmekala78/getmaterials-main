import { NextResponse } from "next/server";
import { connectDB, User, Material } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

export const dynamic = "force-dynamic";

const materialSelect =
  "title slug type subject views downloads createdAt program branch semester rating thumbnailUrl uploadedBy";

// GET /api/bookmarks - get user's bookmarked materials
export async function GET() {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(authUser.id).select("bookmarks");
    if (!user || !user.bookmarks?.length) {
      return NextResponse.json({ bookmarks: [] });
    }

    const materials = await Material.find({ _id: { $in: user.bookmarks } })
      .populate("subject", "name slug")
      .populate("uploadedBy", "name role")
      .select(materialSelect)
      .lean();

    // Preserve bookmark order
    const byId = new Map(materials.map((m: any) => [m._id.toString(), m]));
    const ordered = user.bookmarks
      .map((id: any) => byId.get(id.toString()))
      .filter(Boolean);

    return NextResponse.json({ bookmarks: ordered });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

// POST /api/bookmarks - add a bookmark
export async function POST(request: Request) {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { materialId } = await request.json();
    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
    }

    await connectDB();

    const material = await Material.findById(materialId).select("_id");
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    await User.findByIdAndUpdate(authUser.id, {
      $addToSet: { bookmarks: materialId },
    });

    return NextResponse.json({ message: "Bookmark added" });
  } catch {
    return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}

// DELETE /api/bookmarks - remove a bookmark
export async function DELETE(request: Request) {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { materialId } = await request.json();
    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
    }

    await connectDB();

    await User.findByIdAndUpdate(authUser.id, {
      $pull: { bookmarks: materialId },
    });

    return NextResponse.json({ message: "Bookmark removed" });
  } catch {
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 });
  }
}
