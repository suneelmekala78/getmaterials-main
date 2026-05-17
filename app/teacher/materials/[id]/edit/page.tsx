import { auth } from "@/lib/auth";
import { connectDB, Material, Subject, Chapter, College } from "@getmaterials/database";
import { redirect, notFound } from "next/navigation";
import { EditMaterialForm } from "@/components/teacher/EditMaterialForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Material - GetMaterials",
};

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as any;
  if (user.role !== "teacher" && user.role !== "admin") redirect("/dashboard");

  const { id } = await params;

  await connectDB();

  const material = await Material.findById(id).lean();
  if (!material) notFound();

  // Only uploader or admin
  if ((material as any).uploadedBy.toString() !== user.id && user.role !== "admin") {
    redirect("/teacher/materials");
  }

  const [subjects, chapters, colleges] = await Promise.all([
    Subject.find({}).sort({ name: 1 }).lean(),
    Chapter.find({}).sort({ order: 1 }).lean(),
    College.find({ status: "active" }).sort({ name: 1 }).lean(),
  ]);

  const subjectsData = subjects.map((s: any) => ({
    id: s._id.toString(),
    name: s.name,
    slug: s.slug,
  }));

  const chaptersData = chapters.map((c: any) => ({
    id: c._id.toString(),
    title: c.title,
    subject: c.subject.toString(),
  }));

  const collegesData = colleges.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    code: c.code,
  }));

  const materialData = {
    id: (material as any)._id.toString(),
    title: (material as any).title,
    description: (material as any).description || "",
    type: (material as any).type,
    materialCategory: (material as any).materialCategory || "notes",
    program: (material as any).program || "btech",
    subject: (material as any).subject.toString(),
    chapter: (material as any).chapter.toString(),
    college: (material as any).college?.toString() || "",
    tags: (material as any).tags || [],
    fileUrl: (material as any).fileUrl || "",
    externalUrl: (material as any).externalUrl || "",
    thumbnailUrl: (material as any).thumbnailUrl || "",
    attachments: ((material as any).attachments || []).map((a: any) => ({
      type: a.type,
      fileUrl: a.fileUrl || "",
      externalUrl: a.externalUrl || "",
      fileName: a.fileName || "",
    })),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Material</h1>
        <p className="text-slate-500 mt-1">Update your study material details and files.</p>
      </div>

      <EditMaterialForm
        material={materialData}
        subjects={subjectsData}
        chapters={chaptersData}
        colleges={collegesData}
      />
    </div>
  );
}
