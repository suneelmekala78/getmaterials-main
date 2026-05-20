import { NextRequest, NextResponse } from "next/server";
import { connectDB, Referral } from "@getmaterials/database";
import { auth } from "@/lib/auth";

/**
 * POST /api/auth/track-referral
 * Called from the client after login (especially Google OAuth) to save referral data.
 * Only saves if the user doesn't already have a referral record.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { source, medium, campaign, referrer, referralCode, landingPage } = body;

    // Only save if there's meaningful referral data
    if (!source && !referrer && !campaign) {
      return NextResponse.json({ message: "No referral data to track" });
    }

    await connectDB();

    // Check if referral already exists for this user
    const existing = await Referral.findOne({ user: userId });
    if (existing) {
      return NextResponse.json({ message: "Referral already tracked" });
    }

    await Referral.create({
      user: userId,
      source: (source || "direct").slice(0, 100),
      medium: (medium || "").slice(0, 100),
      campaign: (campaign || "").slice(0, 100),
      referrer: (referrer || "").slice(0, 100),
      referralCode: (referralCode || "").slice(0, 50),
      landingPage: (landingPage || "/").slice(0, 500),
    });

    return NextResponse.json({ message: "Referral tracked" });
  } catch (error) {
    console.error("Track referral error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
