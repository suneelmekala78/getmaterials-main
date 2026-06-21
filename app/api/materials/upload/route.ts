import { NextRequest, NextResponse } from "next/server";
import { connectDB, Material, Subject, Chapter } from "@getmaterials/database";
import { getUser } from "@/lib/get-user";
import { uploadToS3, generateS3Key, getS3Url } from "@/lib/s3";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@getmaterials/shared";
import slugify from "slugify";
import { nanoid } from "nanoid";

/**
 * POST /api/materials/upload
 * Mobile-friendly combined endpoint: uploads file to S3 + creates material record.
 * Accepts multipart/form-data with file + metadata fields.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.status !== "active") {
      return NextResponse.json(
        { error: "Your account is not active" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const program = (formData.get("program") as string) || "btech";
    const branch = (formData.get("branch") as string) || "";
    const semester = formData.get("semester") as string;
    const subject = formData.get("subject") as string;
    const chapter = formData.get("chapter") as string;
    const externalUrl = formData.get("externalUrl") as string;

    if (!title?.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    await connectDB();

    let fileUrl = "";
    let fileType: "pdf" | "video" | "link" | "image" | "assignment" = "pdf";
    let fileName = "";
    let fileSize = 0;

    // Handle file upload
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File size exceeds limit (10MB)" },
          { status: 400 }
        );
      }

      const mimeType = file.type;
      if (mimeType.includes("pdf")) fileType = "pdf";
      else if (mimeType.includes("video")) fileType = "video";
      else if (mimeType.includes("image")) fileType = "image";

      const key = generateS3Key("materials", file.name, authUser.id);
      const buffer = Buffer.from(await file.arrayBuffer());
      await uploadToS3(key, buffer, file.type);
      fileUrl = getS3Url(key);
      fileName = file.name;
      fileSize = file.size;
    } else if (externalUrl) {
      // YouTube or external link
      fileType = "video";
    } else {
      return NextResponse.json(
        { error: "File or external URL is required" },
        { status: 400 }
      );
    }

    const slug =
      slugify(title.trim(), { lower: true, strict: true }) + "-" + nanoid(6);

    // Students go to review; teachers/admins publish directly
    const status =
      authUser.role === "student" ? "under_review" : "published";

    const materialData: any = {
      title: title.trim(),
      description: description.trim(),
      slug,
      type: fileType,
      materialCategory: "notes",
      program: program.toLowerCase(),
      branch: branch.toUpperCase() || undefined,
      semester: semester ? parseInt(semester) : undefined,
      subject: subject || undefined,
      chapter: chapter || undefined,
      uploadedBy: authUser.id,
      status,
      isPublic: true,
      attachments: [
        {
          type: fileType,
          fileUrl: fileUrl || undefined,
          externalUrl: externalUrl || undefined,
          fileName: fileName || undefined,
          fileSize: fileSize || undefined,
        },
      ],
    };

    // Remove undefined fields
    Object.keys(materialData).forEach((key) => {
      if (materialData[key] === undefined) delete materialData[key];
    });

    const material = await Material.create(materialData);

    // Increment counts for published materials
    if (status === "published") {
      const updates: Promise<any>[] = [];
      if (subject) {
        updates.push(
          Subject.findByIdAndUpdate(subject, { $inc: { materialsCount: 1 } })
        );
      }
      if (chapter) {
        updates.push(
          Chapter.findByIdAndUpdate(chapter, { $inc: { materialsCount: 1 } })
        );
      }
      if (updates.length) await Promise.all(updates);
    }

    return NextResponse.json({
      message: "Material uploaded successfully",
      material: { id: material._id, slug: material.slug, status },
    });
  } catch (error) {
    console.error("Mobile upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
