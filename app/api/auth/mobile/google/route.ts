import { NextRequest, NextResponse } from "next/server";
import { connectDB, User, RefreshToken } from "@getmaterials/database";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const MOBILE_WEB_CLIENT_ID =
  "377241660777-hs3iovq384958o21a1d284hg3ibr294p.apps.googleusercontent.com";
const MOBILE_ANDROID_CLIENT_ID =
  "377241660777-ti9r9tnj1pmftqm61acfpk0dnar0iahb.apps.googleusercontent.com";
const MOBILE_IOS_CLIENT_ID =
  "377241660777-fnfga8647t6jt01mej7rfenkgs8k413p.apps.googleusercontent.com";

function allowedGoogleAudiences(): string[] {
  return [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_MOBILE_CLIENT_ID,
    MOBILE_WEB_CLIENT_ID,
    MOBILE_ANDROID_CLIENT_ID,
    MOBILE_IOS_CLIENT_ID,
  ].filter((id): id is string => Boolean(id));
}

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
    const { email, name, picture, email_verified, sub } = googlePayload;

    // Validate the token is for our web or mobile clients
    const audiences = allowedGoogleAudiences();
    if (!audiences.includes(googlePayload.aud)) {
      return NextResponse.json(
        { error: "Token not issued for this application" },
        { status: 401 }
      );
    }

    if (!email || (email_verified !== "true" && email_verified !== true)) {
      return NextResponse.json(
        { error: "Google account email not verified" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find by googleId first, then email
    let user =
      (sub && (await User.findOne({ googleId: sub }))) ||
      (await User.findOne({ email: email.toLowerCase() }));

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        name: name || email.split("@")[0],
        avatar: picture,
        googleId: sub,
        role: "student",
        status: "active",
        emailVerified: new Date(),
      });
    } else {
      if (user.status === "suspended") {
        return NextResponse.json(
          { error: "Your account has been suspended" },
          { status: 403 }
        );
      }
      // Link googleId / refresh profile fields if needed
      const updates: Record<string, unknown> = {};
      if (sub && !user.googleId) updates.googleId = sub;
      if (picture && !user.avatar) updates.avatar = picture;
      if (!user.emailVerified) updates.emailVerified = new Date();
      if (Object.keys(updates).length) {
        await User.findByIdAndUpdate(user._id, updates);
        Object.assign(user, updates);
      }
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
