import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, Donation } from "@getmaterials/database";
import { getRazorpay, verifyRazorpaySignature } from "@/lib/razorpay";
import { createDonationSchema } from "@getmaterials/shared";
import { nanoid } from "nanoid";

// Create a Razorpay order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createDonationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { amount, currency, message } = parsed.data;
    const session = await auth();

    const order = await getRazorpay().orders.create({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: currency || "INR",
      receipt: `donation_${nanoid(10)}`,
    });

    await connectDB();

    await Donation.create({
      user: session?.user ? (session.user as any).id : undefined,
      name: body.name,
      email: body.email,
      amount,
      currency: currency || "INR",
      method: "razorpay",
      razorpayOrderId: order.id,
      transactionId: order.id,
      status: "pending",
      message,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Donation order error:", error);
    return NextResponse.json(
      { error: "Failed to create donation order" },
      { status: 500 }
    );
  }
}

// Verify payment
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification data" },
        { status: 400 }
      );
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    await connectDB();

    await Donation.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: "completed",
      }
    );

    return NextResponse.json({ message: "Donation verified successfully" });
  } catch (error) {
    console.error("Donation verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify donation" },
      { status: 500 }
    );
  }
}
