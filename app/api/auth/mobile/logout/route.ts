import { NextRequest, NextResponse } from "next/server";
import { connectDB, RefreshToken } from "@getmaterials/database";
import { verifyRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ message: "Logged out" });
    }

    await connectDB();

    // Delete the specific refresh token
    await RefreshToken.deleteOne({ token: refreshToken });

    return NextResponse.json({ message: "Logged out successfully" });
  } catch {
    return NextResponse.json({ message: "Logged out" });
  }
}

// DELETE all sessions for the user (logout everywhere)
export async function DELETE(req: NextRequest) {
  try {
    const authorization = req.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authorization.slice(7);
    const { verifyAccessToken } = await import("@/lib/jwt");
    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    await RefreshToken.deleteMany({ userId: payload.sub });

    return NextResponse.json({ message: "All sessions revoked" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
