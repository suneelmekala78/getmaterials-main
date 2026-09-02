import { auth } from "@/lib/auth";
import { connectDB, Material, Subject, Chapter, College } from "@/lib/database";
import { normalizeTags } from "@/lib/tags";
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

  if ((material as any).uploadedBy.toString() !== user.id && user.role !== "admin") {
    redirect("/teacher/materials");
  }

  const [subjects, chapters, colleges] = await Promise.all([
    Subject.find({}).sort({ name: 1 }).lean(),
    Chapter.find({}).sort({ order: 1 }).lean(),
    College.find({ status: "active" }).sort({ name: 1 }).lean(),
  ]);

  const doc = material as any;
  const rawTagsDoc = await Material.collection.findOne(
    { _id: doc._id },
    { projection: { tags: 1 } }
  );
  const materialData = {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || "",
    type: doc.type,
    materialCategory: doc.materialCategory || "notes",
    program: doc.program || "",
    branch: doc.branch || "",
    section: doc.section || "",
    semester: doc.semester || "",
    batch: doc.batch || "",
    isPublic: doc.isPublic !== false,
    status: doc.status || "published",
    subject: doc.subject.toString(),
    chapter: doc.chapter?.toString() || "",
    college: doc.college?.toString() || "",
    collegeIds: [
      ...new Set(
        [
          doc.college?.toString(),
          ...((doc.colleges || []).map((item: any) => item.toString())),
        ].filter(Boolean)
      ),
    ],
    tags: normalizeTags(rawTagsDoc?.tags ?? doc.tags),
    thumbnailUrl: doc.thumbnailUrl || doc.coverUrl || doc.cover || "",
    attachments: (doc.attachments || []).map((a: any) => ({
      type: a.type,
      fileUrl: a.fileUrl || a.url || "",
      externalUrl: a.externalUrl || "",
      fileName: a.fileName || "",
      mimeType: a.mimeType || "",
      fileSize: a.fileSize || 0,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Edit Material</h1>
        <p className="text-slate-500 mt-1">Update your study material details and files.</p>
      </div>

      <EditMaterialForm
        material={materialData}
        subjects={subjects.map((s: any) => ({
          id: s._id.toString(),
          name: s.name,
          slug: s.slug,
        }))}
        chapters={chapters.map((c: any) => ({
          id: c._id.toString(),
          title: c.title,
          subject: c.subject.toString(),
        }))}
        colleges={colleges.map((c: any) => ({
          id: c._id.toString(),
          name: c.name,
          code: c.code,
          programs: c.programs || [],
          branches: c.branches || [],
        }))}
        userRole={user.role}
      />
    </div>
  );
}
