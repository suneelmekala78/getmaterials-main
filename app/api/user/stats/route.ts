import { NextResponse } from "next/server";
import { connectDB, Material } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

// GET /api/user/stats - Get user stats (materials count, total downloads)
export async function GET() {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const materials = await Material.find({ uploadedBy: authUser.id })
      .select("downloads views")
      .lean();

    const materialsCount = materials.length;
    const totalDownloads = materials.reduce(
      (sum: number, m: any) => sum + (m.downloads || 0),
      0
    );
    const totalViews = materials.reduce(
      (sum: number, m: any) => sum + (m.views || 0),
      0
    );

    return NextResponse.json({
      stats: {
        materialsCount,
        totalDownloads,
        totalViews,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
