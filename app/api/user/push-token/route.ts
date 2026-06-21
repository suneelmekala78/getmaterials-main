import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

// POST /api/user/push-token - Register a push notification token
export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pushToken, platform, deviceName } = await req.json();

    if (!pushToken || typeof pushToken !== "string") {
      return NextResponse.json(
        { error: "Push token is required" },
        { status: 400 }
      );
    }

    if (!platform || !["android", "ios"].includes(platform)) {
      return NextResponse.json(
        { error: "Valid platform (android/ios) is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Remove existing entry with same token (avoid duplicates), then add new
    await User.updateOne(
      { _id: authUser.id },
      { $pull: { pushDevices: { pushToken } } }
    );

    await User.updateOne(
      { _id: authUser.id },
      {
        $push: {
          pushDevices: {
            pushToken,
            platform,
            deviceName: deviceName || "Unknown Device",
            createdAt: new Date(),
          },
        },
      }
    );

    return NextResponse.json({ message: "Push token registered" });
  } catch (error) {
    console.error("Push token registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
