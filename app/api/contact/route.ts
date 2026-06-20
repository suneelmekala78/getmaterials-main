import { NextResponse } from "next/server";
import { connectDB, ContactMessage } from "@getmaterials/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, website } = body;

    // Honeypot — if filled, it's a bot
    if (website) {
      return NextResponse.json({ message: "Message sent successfully. We'll get back to you soon." });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    await connectDB();
    await ContactMessage.create({ name, email, subject, message });

    return NextResponse.json({ message: "Message sent successfully. We'll get back to you soon." });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
