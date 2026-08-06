import { NextResponse } from "next/server";
import { connectDB, ContactMessage } from "@getmaterials/database";
import { contactSchema } from "@getmaterials/shared";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { website } = body;

    // Honeypot — if filled, it's a bot
    if (website) {
      return NextResponse.json({
        message: "Message sent successfully. We'll get back to you soon.",
      });
    }

    const parsed = contactSchema.safeParse({
      name: body.name,
      email: body.email,
      subject: body.subject || undefined,
      message: body.message,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid form data" },
        { status: 400 }
      );
    }

    await connectDB();
    await ContactMessage.create({
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      subject: parsed.data.subject?.trim() || "",
      message: parsed.data.message.trim(),
    });

    return NextResponse.json({
      message: "Message sent successfully. We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
