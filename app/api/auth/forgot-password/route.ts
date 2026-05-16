import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB, User } from "@getmaterials/database";
import { forgotPasswordSchema } from "@getmaterials/shared";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with that email, a reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password - GetMaterials",
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">GetMaterials</h1>
          </div>
          <h2 style="color: #1e293b; font-size: 20px;">Reset your password</h2>
          <p style="color: #475569; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">
            This link expires in 30 minutes. If you didn't request this, ignore this email.
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
            — The GetMaterials Team
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "If an account exists with that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
