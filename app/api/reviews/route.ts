import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, Review, Material } from "@getmaterials/database";

export const dynamic = "force-dynamic";

// GET /api/reviews?materialId=xxx - get reviews for a material
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const materialId = searchParams.get("materialId");

    if (!materialId) {
      return NextResponse.json({ error: "Material ID required" }, { status: 400 });
    }

    await connectDB();

    const reviews = await Review.find({ material: materialId, isApproved: true })
      .populate("user", "name avatar role")
      .sort({ createdAt: -1 })
      .lean();

    // Calculate average rating
    const totalRatings = reviews.length;
    const avgRating = totalRatings > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalRatings
      : 0;

    // Rating distribution
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((r: any) => {
      distribution[r.rating - 1]++;
    });

    return NextResponse.json({
      reviews,
      stats: {
        average: Math.round(avgRating * 10) / 10,
        total: totalRatings,
        distribution,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews - submit a review
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { materialId, rating, comment } = await req.json();

    if (!materialId || !rating || !comment) {
      return NextResponse.json({ error: "Material ID, rating, and comment are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (comment.trim().length < 3) {
      return NextResponse.json({ error: "Comment must be at least 3 characters" }, { status: 400 });
    }

    await connectDB();

    // Check if material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Check if user already reviewed
    const existing = await Review.findOne({ material: materialId, user: session.user.id });
    if (existing) {
      // Update existing review
      existing.rating = rating;
      existing.comment = comment.trim();
      await existing.save();

      // Recalculate material rating
      const allReviews = await Review.find({ material: materialId, isApproved: true });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await Material.findByIdAndUpdate(materialId, {
        rating: { average: Math.round(avg * 10) / 10, count: allReviews.length },
      });

      return NextResponse.json({ message: "Review updated", review: existing });
    }

    // Create new review
    const review = await Review.create({
      material: materialId,
      user: session.user.id,
      rating,
      comment: comment.trim(),
    });

    // Update material rating
    const allReviews = await Review.find({ material: materialId, isApproved: true });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Material.findByIdAndUpdate(materialId, {
      rating: { average: Math.round(avg * 10) / 10, count: allReviews.length },
    });

    return NextResponse.json({ message: "Review submitted", review }, { status: 201 });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: "You already reviewed this material" }, { status: 400 });
    }
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

// DELETE /api/reviews?id=xxx - delete own review
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 });
    }

    await connectDB();

    const review = await Review.findOne({ _id: id, user: session.user.id });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const materialId = review.material;
    await review.deleteOne();

    // Recalculate material rating
    const allReviews = await Review.find({ material: materialId, isApproved: true });
    const avg = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;
    await Material.findByIdAndUpdate(materialId, {
      rating: { average: Math.round(avg * 10) / 10, count: allReviews.length },
    });

    return NextResponse.json({ message: "Review deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
