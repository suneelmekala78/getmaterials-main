import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB, User, Otp } from "@getmaterials/database";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(`resend-verification:${ip}`, 3, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.updateMany({ email: email.toLowerCase(), used: false }, { used: true });
    await Otp.create({ email: email.toLowerCase(), code, expiresAt });

    await sendEmail({
      to: email,
      subject: "Verify your email - GetMaterials",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">GetMaterials</h1>
          </div>
          <h2 style="color: #1e293b; font-size: 20px;">Verify your email</h2>
          <p style="color: #475569; line-height: 1.6;">Here's your new verification code:</p>
          <div style="text-align: center; margin: 32px 0;">
            <span style="display: inline-block; background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b;">
              ${code}
            </span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">This code expires in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to resend code" },
      { status: 500 }
    );
  }
}
