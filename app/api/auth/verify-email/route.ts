import { NextRequest, NextResponse } from "next/server";
import { connectDB, User, Otp } from "@getmaterials/database";
import { sendEmail, getWelcomeEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find valid OTP
    const otp = await Otp.findOne({
      email: email.toLowerCase(),
      code: code.trim(),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Mark OTP as used
    otp.used = true;
    await otp.save();

    // Mark user email as verified
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { emailVerified: new Date() },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Send welcome email
    sendEmail({
      to: email,
      subject: "Welcome to GetMaterials!",
      html: getWelcomeEmailHtml(user.name),
    }).catch(() => {});

    return NextResponse.json({
      message: "Email verified successfully! You can now log in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
