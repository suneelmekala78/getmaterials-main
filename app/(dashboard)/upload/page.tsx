import { UploadForm } from "@/components/teacher/UploadForm";
import { connectDB, Subject, Chapter, College, User } from "@getmaterials/database";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Upload Material - GetMaterials",
};

export default async function StudentUploadPage() {
  const session = await auth();
  const user = session?.user as any;

  if (!user) redirect("/login");

  await connectDB();

  const [subjects, chapters, colleges, currentUser] = await Promise.all([
    Subject.find({}).sort({ name: 1 }).lean(),
    Chapter.find({}).sort({ order: 1 }).lean(),
    College.find({ status: "active" }).sort({ name: 1 }).lean(),
    User.findById(user.id).select("assignedColleges").lean(),
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
    programs: c.programs || [],
    branches: c.branches || [],
  }));

  // Get the list of college IDs this user can upload to
  const assignedCollegeIds = ((currentUser as any)?.assignedColleges || []).map(
    (id: any) => id.toString()
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload Material</h1>
        <p className="text-slate-500 mt-1">
          Share study materials with everyone. Upload PDFs, videos, links, and more.
        </p>
      </div>

      {user.role === "student" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Review Required</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your uploads will be reviewed by our team before they are published. You&apos;ll be notified once approved.
            </p>
          </div>
        </div>
      )}

      <UploadForm subjects={subjectsData} chapters={chaptersData} colleges={collegesData} assignedColleges={assignedCollegeIds} />
    </div>
  );
}
