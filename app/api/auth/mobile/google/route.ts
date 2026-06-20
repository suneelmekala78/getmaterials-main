import { NextRequest, NextResponse } from "next/server";
import { connectDB, User, RefreshToken } from "@getmaterials/database";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, deviceName } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: "Google ID token is required" },
        { status: 400 }
      );
    }

    // Verify Google ID token
    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!googleResponse.ok) {
      return NextResponse.json(
        { error: "Invalid Google token" },
        { status: 401 }
      );
    }

    const googlePayload = await googleResponse.json();
    const { email, name, picture, email_verified } = googlePayload;

    // Validate the token is for our app
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (googlePayload.aud !== clientId) {
      return NextResponse.json(
        { error: "Token not issued for this application" },
        { status: 401 }
      );
    }

    if (!email || !email_verified) {
      return NextResponse.json(
        { error: "Google account email not verified" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name: name || email.split("@")[0],
        avatar: picture,
        role: "student",
        status: "active",
        emailVerified: new Date(),
      });
    } else if (user.status === "suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended" },
        { status: 403 }
      );
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });

    const refreshToken = await signRefreshToken(user._id.toString());

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      deviceName: deviceName || "Mobile (Google)",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return NextResponse.json({
      accessToken,
      refreshToken,
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
    console.error("Mobile Google auth error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
