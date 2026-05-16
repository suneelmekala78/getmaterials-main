import { NextRequest, NextResponse } from "next/server";
import { connectDB, Subject } from "@getmaterials/database";
import { getCached } from "@/lib/cache";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const cacheKey = `subjects:${category || "all"}`;
    const subjects = await getCached(
      cacheKey,
      async () => {
        const query: any = { isActive: true };
        if (category) query.category = category;
        return Subject.find(query).sort({ name: 1 }).lean();
      },
      600 // 10 min cache
    );

    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Get subjects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
