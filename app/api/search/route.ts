import { NextRequest, NextResponse } from "next/server";
import { searchMaterials } from "@/lib/search";
import { connectDB, Material } from "@getmaterials/database";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type");
    const subject = searchParams.get("subject");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Build filter
    const filters: string[] = [];
    if (type) filters.push(`type = "${type}"`);
    if (subject) filters.push(`subjectSlug = "${subject}"`);

    const results = await searchMaterials(query, {
      limit,
      offset: (page - 1) * limit,
      filter: filters.length > 0 ? filters.join(" AND ") : undefined,
    });

    // If Meilisearch is not available, fall back to MongoDB text search
    if (!results || results.hits.length === 0) {
      await connectDB();
      const mongoResults = await Material.find(
        { $text: { $search: query }, status: "published", isPublic: true },
        { score: { $meta: "textScore" } }
      )
        .populate("subject", "name slug")
        .populate("chapter", "title slug")
        .populate("uploadedBy", "name avatar")
        .sort({ score: { $meta: "textScore" } })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return NextResponse.json({
        hits: mongoResults,
        total: mongoResults.length,
        query,
      });
    }

    return NextResponse.json({
      hits: results.hits,
      total: results.estimatedTotalHits,
      query,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
