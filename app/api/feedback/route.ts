import { NextResponse } from "next/server";
import { connectDB, SiteFeedback } from "@getmaterials/database";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, rating, message, website } = body;

    // Honeypot — if filled, it's a bot
    if (website) {
      return NextResponse.json({ message: "Thanks for your feedback!" });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    await connectDB();

    await SiteFeedback.create({
      name,
      email,
      rating: rating || 5,
      message,
    });

    return NextResponse.json({ message: "Thanks for your feedback!" });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
