import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, User, Material } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET /api/bookmarks - get user's bookmarked materials
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("bookmarks");
    if (!user || !user.bookmarks?.length) {
      return NextResponse.json({ bookmarks: [] });
    }

    const materials = await Material.find({ _id: { $in: user.bookmarks } })
      .populate("subject", "name slug")
      .select("title slug type subject views createdAt")
      .lean();

    return NextResponse.json({ bookmarks: materials });
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}

// POST /api/bookmarks - add a bookmark
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { materialId } = await request.json();
    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
    }

    await connectDB();

    await User.findByIdAndUpdate(session.user.id, {
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { materialId } = await request.json();
    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
    }

    await connectDB();

    await User.findByIdAndUpdate(session.user.id, {
      $pull: { bookmarks: materialId },
    });

    return NextResponse.json({ message: "Bookmark removed" });
  } catch {
    return NextResponse.json({ error: "Failed to remove bookmark" }, { status: 500 });
  }
}
