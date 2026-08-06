import { NextResponse } from "next/server";
import { connectDB, Material } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

export const dynamic = "force-dynamic";

// GET /api/user/uploads - materials uploaded by the current user
export async function GET(request: Request) {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    await connectDB();

    const query: any = { uploadedBy: authUser.id };
    if (status && ["published", "draft", "under_review"].includes(status)) {
      query.status = status;
    }

    const materials = await Material.find(query)
      .populate("subject", "name slug")
      .sort({ createdAt: -1 })
      .select(
        "title slug type status subject views downloads createdAt program branch semester thumbnailUrl attachments materialCategory"
      )
      .lean();

    return NextResponse.json({ materials });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 }
    );
  }
}
