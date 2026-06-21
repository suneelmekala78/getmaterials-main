import { NextRequest, NextResponse } from "next/server";
import { connectDB, User } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";

// GET /api/user/profile - get current user profile
export async function GET() {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(authUser.id).select(
      "name email avatar role status bio qualifications college"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        bio: user.bio,
        qualifications: user.qualifications,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/profile - update user profile
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name?.trim() || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "Name must be at most 100 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findByIdAndUpdate(
      authUser.id,
      { name: name.trim() },
      { new: true }
    ).select("name email role");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated", user });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
