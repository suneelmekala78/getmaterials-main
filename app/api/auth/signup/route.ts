import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDB, User, Otp } from "@getmaterials/database";
import { signupSchema } from "@getmaterials/shared";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (unverified)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      status: role === "teacher" ? "pending" : "active",
    });

    // Generate 6-digit OTP for email verification
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate previous OTPs
    await Otp.updateMany({ email: email.toLowerCase(), used: false }, { used: true });
    await Otp.create({ email: email.toLowerCase(), code, expiresAt });

    // Send verification email
    sendEmail({
      to: email,
      subject: "Verify your email - GetMaterials",
      html: getVerificationEmailHtml(name, code),
    }).catch(() => {});

    return NextResponse.json(
      {
        message: "Account created! Please check your email for the verification code.",
        requiresVerification: true,
        email: email.toLowerCase(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getVerificationEmailHtml(name: string, code: string): string {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">GetMaterials</h1>
      </div>
      <h2 style="color: #1e293b; font-size: 20px;">Verify your email, ${name}!</h2>
      <p style="color: #475569; line-height: 1.6;">
        Use the code below to verify your email address and complete your registration.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 12px; padding: 16px 32px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #1e293b;">
          ${code}
        </span>
      </div>
      <p style="color: #94a3b8; font-size: 13px;">
        This code expires in 10 minutes. If you didn't create an account, ignore this email.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
        — The GetMaterials Team
      </p>
    </div>
  `;
}
