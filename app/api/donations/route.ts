import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, Donation } from "@getmaterials/database";
// import { getRazorpay, verifyRazorpaySignature } from "@/lib/razorpay";
// import { createDonationSchema } from "@getmaterials/shared";
import { nanoid } from "nanoid";
import { z } from "zod";

const donationIntentSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email is required"),
});

// Record donation intent (name + email for QR-based donation)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = donationIntentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email } = parsed.data;
    const session = await auth();

    await connectDB();

    await Donation.create({
      user: session?.user ? (session.user as any).id : undefined,
      name,
      email,
      amount: 0,
      currency: "INR",
      method: "upi_qr",
      transactionId: `qr_${nanoid(10)}`,
      status: "pending",
    });

    return NextResponse.json({ message: "Donation details saved successfully" });
  } catch (error) {
    console.error("Donation intent error:", error);
    return NextResponse.json(
      { error: "Failed to save donation details" },
      { status: 500 }
    );
  }
}

// Razorpay payment verification - commented out until approval
// export async function PUT(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
//
//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return NextResponse.json(
//         { error: "Missing payment verification data" },
//         { status: 400 }
//       );
//     }
//
//     const isValid = verifyRazorpaySignature(
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature
//     );
//
//     if (!isValid) {
//       return NextResponse.json(
//         { error: "Invalid payment signature" },
//         { status: 400 }
//       );
//     }
//
//     await connectDB();
//
//     await Donation.findOneAndUpdate(
//       { razorpayOrderId: razorpay_order_id },
//       {
//         razorpayPaymentId: razorpay_payment_id,
//         status: "completed",
//       }
//     );
//
//     return NextResponse.json({ message: "Donation verified successfully" });
//   } catch (error) {
//     console.error("Donation verification error:", error);
//     return NextResponse.json(
//       { error: "Failed to verify donation" },
//       { status: 500 }
//     );
//   }
// }
