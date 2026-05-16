import { NextRequest, NextResponse } from "next/server";
import { connectDB, Donation } from "@getmaterials/database";

// Get donation leaderboard (top donors)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const leaderboard = await Donation.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: { $ifNull: ["$email", "$user"] },
          name: { $first: "$name" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ["$name", "Anonymous"] },
          totalAmount: 1,
          count: 1,
        },
      },
    ]);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
