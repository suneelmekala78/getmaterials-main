import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { connectDB, User, RefreshToken } from "@getmaterials/database";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

const APPLE_BUNDLE_ID = "in.getmaterials.app";

function allowedAppleAudiences(): string[] {
  return [
    process.env.APPLE_CLIENT_ID,
    APPLE_BUNDLE_ID,
  ].filter((id): id is string => Boolean(id));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identityToken, fullName, email: clientEmail, deviceName } = body;

    if (!identityToken) {
      return NextResponse.json(
        { error: "Apple identity token is required" },
        { status: 400 }
      );
    }

    let payload: Record<string, unknown>;
    try {
      const verified = await jwtVerify(identityToken, APPLE_JWKS, {
        issuer: "https://appleid.apple.com",
        audience: allowedAppleAudiences(),
      });
      payload = verified.payload as Record<string, unknown>;
    } catch (err) {
      console.error("Apple token verify failed:", err);
      return NextResponse.json(
        { error: "Invalid Apple identity token" },
        { status: 401 }
      );
    }

    const appleSub = payload.sub as string | undefined;
    const tokenEmail = (payload.email as string | undefined)?.toLowerCase();
    const emailVerified =
      payload.email_verified === true ||
      payload.email_verified === "true";

    if (!appleSub) {
      return NextResponse.json(
        { error: "Invalid Apple token payload" },
        { status: 401 }
      );
    }

    await connectDB();

    let user = await User.findOne({ appleId: appleSub });

    // First sign-in: Apple may include email; later sign-ins often omit it
    const email =
      tokenEmail ||
      (typeof clientEmail === "string" ? clientEmail.toLowerCase() : null);

    if (!user && email) {
      user = await User.findOne({ email });
      if (user && !user.appleId) {
        user.appleId = appleSub;
        if (!user.emailVerified && emailVerified) {
          user.emailVerified = new Date();
        }
        await user.save();
      }
    }

    if (!user) {
      if (!email) {
        return NextResponse.json(
          {
            error:
              "Unable to create account. Please try again and share your email with Apple Sign In.",
          },
          { status: 400 }
        );
      }

      const nameFromClient =
        typeof fullName === "string" && fullName.trim().length > 1
          ? fullName.trim()
          : email.split("@")[0];

      user = await User.create({
        email,
        name: nameFromClient,
        appleId: appleSub,
        role: "student",
        status: "active",
        emailVerified: new Date(),
      });
    } else if (user.status === "suspended") {
      return NextResponse.json(
        { error: "Your account has been suspended" },
        { status: 403 }
      );
    } else {
      // Update name if Apple provided it on this sign-in
      if (
        typeof fullName === "string" &&
        fullName.trim().length > 1 &&
        (!user.name || user.name === user.email.split("@")[0])
      ) {
        user.name = fullName.trim();
        await user.save();
      }
    }

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
      deviceName: deviceName || "Mobile (Apple)",
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
    console.error("Mobile Apple auth error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
