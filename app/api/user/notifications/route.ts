import { NextRequest, NextResponse } from "next/server";
import { connectDB, Material, Review } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

interface UserNotification {
  id: string;
  type: "review" | "download";
  icon: string;
  iconColor: string;
  title: string;
  time: string | Date;
  isRead: boolean;
}

// GET /api/user/notifications - Get user notifications based on activity
export async function GET(req: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user's materials to find activity on them
    const userMaterials = await Material.find({ uploadedBy: authUser.id })
      .select("_id title downloads views")
      .lean();

    const materialIds = userMaterials.map((m: any) => m._id);

    // Get recent reviews on user's materials
    const recentReviews = await Review.find({
      material: { $in: materialIds },
    })
      .populate("user", "name")
      .populate("material", "title")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Build notifications from reviews
    const notifications: UserNotification[] = recentReviews.map((review: any) => ({
      id: review._id?.toString(),
      type: "review",
      icon: "chatbubble",
      iconColor: "#10B981",
      title: `${review.user?.name || "Someone"} reviewed your material "${review.material?.title || "Unknown"}"`,
      time: review.createdAt,
      isRead: false,
    }));

    // Add download milestones from user's materials
    for (const mat of userMaterials as any[]) {
      if (mat.downloads >= 100) {
        notifications.push({
          id: `download-${mat._id}`,
          type: "download",
          icon: "download",
          iconColor: "#3B82F6",
          title: `Your material "${mat.title}" reached ${mat.downloads} downloads!`,
          time: new Date().toISOString(),
          isRead: true,
        });
      }
    }

    // Sort by time descending
    notifications.sort(
      (a: any, b: any) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return NextResponse.json({ notifications: notifications.slice(0, 30) });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
