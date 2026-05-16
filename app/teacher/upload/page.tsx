import { UploadForm } from "@/components/teacher/UploadForm";
import { connectDB, Subject, Chapter, College } from "@getmaterials/database";

export const metadata = {
  title: "Upload Material - GetMaterials",
};

export default async function UploadPage() {
  await connectDB();

  const [subjects, chapters, colleges] = await Promise.all([
    Subject.find({}).sort({ name: 1 }).lean(),
    Chapter.find({}).sort({ order: 1 }).lean(),
    College.find({ status: "active" }).sort({ name: 1 }).lean(),
  ]);

  // Serialize for client
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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload Material</h1>
        <p className="text-slate-500 mt-1">
          Share study materials with students. Upload PDFs, videos, links, and more.
        </p>
      </div>

      <UploadForm subjects={subjectsData} chapters={chaptersData} colleges={collegesData} />
    </div>
  );
}
