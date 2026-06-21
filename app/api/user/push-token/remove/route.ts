import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

// POST /api/user/push-token/remove - Remove a push notification token
export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pushToken } = await req.json();

    if (!pushToken || typeof pushToken !== "string") {
      return NextResponse.json(
        { error: "Push token is required" },
        { status: 400 }
      );
    }

    await connectDB();

    await User.updateOne(
      { _id: authUser.id },
      { $pull: { pushDevices: { pushToken } } }
    );

    return NextResponse.json({ message: "Push token removed" });
  } catch (error) {
    console.error("Push token removal error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
