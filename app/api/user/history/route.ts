import { NextResponse } from "next/server";
import { connectDB, User, Material } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

export const dynamic = "force-dynamic";

// GET /api/user/history - materials the user has recently viewed
export async function GET() {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(authUser.id).select("viewHistory").lean();
    const entries = ((user as any)?.viewHistory || []) as Array<{
      material: any;
      at: Date;
    }>;

    if (!entries.length) {
      return NextResponse.json({ materials: [] });
    }

    const ids = entries.map((e) => e.material);
    const materials = await Material.find({ _id: { $in: ids } })
      .populate("subject", "name slug")
      .populate("uploadedBy", "name role")
      .select(
        "title slug type subject views downloads createdAt program branch semester rating thumbnailUrl uploadedBy"
      )
      .lean();

    const byId = new Map(materials.map((m: any) => [m._id.toString(), m]));
    const ordered = entries
      .map((entry) => {
        const material = byId.get(entry.material.toString());
        if (!material) return null;
        return { ...material, historyAt: entry.at };
      })
      .filter(Boolean);

    return NextResponse.json({ materials: ordered });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
