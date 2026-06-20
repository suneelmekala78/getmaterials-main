import { NextRequest, NextResponse } from "next/server";
import { connectDB, User, RefreshToken } from "@getmaterials/database";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify the refresh token JWT signature
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if refresh token exists in DB (not revoked)
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      // Token not found — possible token reuse attack. Revoke all tokens for this user.
      await RefreshToken.deleteMany({ userId: payload.sub });
      return NextResponse.json(
        { error: "Invalid refresh token. All sessions revoked for security." },
        { status: 401 }
      );
    }

    // Get fresh user data
    const user = await User.findById(payload.sub);
    if (!user || user.status === "suspended") {
      await RefreshToken.deleteMany({ userId: payload.sub });
      return NextResponse.json(
        { error: "Account not found or suspended" },
        { status: 403 }
      );
    }

    // Rotate refresh token (delete old, create new)
    await RefreshToken.deleteOne({ _id: storedToken._id });

    const newAccessToken = await signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });

    const newRefreshToken = await signRefreshToken(user._id.toString());

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user._id,
      deviceName: storedToken.deviceName,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
