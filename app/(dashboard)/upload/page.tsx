import { UploadForm } from "@/components/teacher/UploadForm";
import { connectDB, Subject, Chapter, College, User } from "@/lib/database";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, CloudUpload, FileText, Image as ImageIcon, Link2, Video } from "lucide-react";

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

  const assignedCollegeIds = ((currentUser as any)?.assignedColleges || []).map(
    (id: any) => id.toString()
  );

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-sm text-slate-400 mb-4">
        <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-600">Upload Material</span>
      </p>

      <div className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Upload Study Material</h1>
          <p className="text-slate-500 mt-1">Share quality content and help students learn better.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 pr-2">
          <span className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
            <CloudUpload className="w-6 h-6" />
          </span>
          <span className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </span>
          <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
            <ImageIcon className="w-4 h-4" />
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Link2 className="w-4 h-4" />
          </span>
        </div>
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

      <UploadForm
        key="create-upload"
        subjects={subjectsData}
        chapters={chaptersData}
        colleges={collegesData}
        assignedColleges={assignedCollegeIds}
        userRole={user.role}
        successRedirect="/my-materials"
      />
    </div>
  );
}
