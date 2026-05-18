import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB, RoleChangeRequest } from "@getmaterials/database";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role === "admin") {
      return NextResponse.json({ error: "Admins cannot request role changes" }, { status: 400 });
    }

    const { toRole, reason, qualifications } = await req.json();

    if (!toRole || !reason?.trim()) {
      return NextResponse.json({ error: "Role and reason are required" }, { status: 400 });
    }

    if (!["teacher", "college_admin"].includes(toRole)) {
      return NextResponse.json({ error: "Invalid target role" }, { status: 400 });
    }

    if (user.role === toRole) {
      return NextResponse.json({ error: "You already have this role" }, { status: 400 });
    }

    await connectDB();

    // Check for existing pending request
    const existing = await RoleChangeRequest.findOne({
      user: user.id,
      status: "pending",
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending role change request" },
        { status: 409 }
      );
    }

    const request = await RoleChangeRequest.create({
      user: user.id,
      fromRole: user.role,
      toRole,
      reason: reason.trim(),
      qualifications: qualifications?.trim() || undefined,
    });

    return NextResponse.json(
      { message: "Role change request submitted successfully", request },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Role change request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const requests = await RoleChangeRequest.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Get role change requests error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
