import { NextRequest, NextResponse } from "next/server";
import { connectDB, Donation } from "@getmaterials/database";
import { auth } from "@/lib/auth";

// Get current user's donation history
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email;

    await connectDB();

    // Match by user ID or email (some donations may not have user linked)
    const donations = await Donation.find({
      $or: [
        { user: userId },
        { email: email },
      ],
      status: { $in: ["completed", "pending"] },
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const total = donations
      .filter((d: any) => d.status === "completed")
      .reduce((sum: number, d: any) => sum + d.amount, 0);

    return NextResponse.json({ donations, total });
  } catch (error) {
    console.error("Donation history error:", error);
    return NextResponse.json({ error: "Failed to fetch donation history" }, { status: 500 });
  }
}
