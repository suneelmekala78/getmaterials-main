import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Use GetMaterials",
  description:
    "Learn how to use GetMaterials to find, download, and upload study materials. Step-by-step guide for students and teachers.",
  alternates: { canonical: "https://getmaterials.in/how-to-use" },
};

export default function HowToUsePage() {
  return (
    <main className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            How to Use <span className="text-[var(--primary)]">GetMaterials</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your complete guide to finding, downloading, and sharing study materials. 
            Whether you&apos;re a student or teacher, we&apos;ve got you covered.
          </p>
        </div>

        {/* For Students */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">For Students</h2>
          </div>
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Browse Materials</h3>
                <p className="text-slate-600 mb-3">
                  Go to the <strong>Materials</strong> page. You can browse all available study materials without signing up. 
                  Use filters to narrow down by subject, type (PDF, Video, etc.), or search by keyword.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-500">
                    💡 <strong>Tip:</strong> No signup required to browse and view materials!
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Your Program & Subject</h3>
                <p className="text-slate-600 mb-3">
                  Choose your program (B.Tech, M.Tech, BCA, etc.), then select the subject you need materials for. 
                  You&apos;ll see all chapters and materials organized neatly.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Download or View</h3>
                <p className="text-slate-600 mb-3">
                  Click on any material to view its details. You can preview PDFs, watch videos, or download files directly. 
                  Create a free account to bookmark materials and track your downloads.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">College-Specific Materials</h3>
                <p className="text-slate-600 mb-3">
                  If your college is registered on GetMaterials, you can find materials specifically curated for your college. 
                  These are organized by your college&apos;s programs, branches (CSE, ECE, etc.), semesters, and even sections (A, B, C).
                </p>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-700">
                    📋 <strong>College materials include:</strong> Notes, Question Papers, Lab Manuals, Syllabi, Assignments, and Reference materials — all aligned with your curriculum.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Teachers */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">👨‍🏫</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">For Teachers</h2>
          </div>
          <div className="space-y-8">
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Create an Account & Apply as Teacher</h3>
                <p className="text-slate-600 mb-3">
                  Sign up for a free account, then request a role change to &quot;Teacher&quot; from your settings. 
                  Our admin team will review and approve your request.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Materials</h3>
                <p className="text-slate-600 mb-3">
                  Once approved, go to the <strong>Upload</strong> page. You can upload:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mb-3">
                  <li><strong>For Everyone:</strong> Select program, subject, and chapter — available to all students.</li>
                  <li><strong>For Specific College:</strong> Select college, program, branch, section, and semester — visible only to that college&apos;s students.</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Choose Material Type</h3>
                <p className="text-slate-600 mb-3">Upload different types of study materials:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Notes", emoji: "📝" },
                    { label: "Question Papers", emoji: "📄" },
                    { label: "Lab Manuals", emoji: "🔬" },
                    { label: "Syllabus", emoji: "📋" },
                    { label: "Assignments", emoji: "✍️" },
                    { label: "Reference", emoji: "📚" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 flex items-center gap-2">
                      <span>{item.emoji}</span> {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Your Materials</h3>
                <p className="text-slate-600">
                  View analytics, track downloads, and manage all your uploaded materials from the teacher dashboard. 
                  Edit or remove materials at any time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* College Structure */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🏫</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">How College Materials Work</h2>
          </div>
          <p className="text-slate-600 mb-6">
            GetMaterials supports a hierarchical college structure. Here&apos;s how materials are organized for colleges:
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-violet-100 rounded flex items-center justify-center text-xs font-bold text-violet-700 mt-0.5">1</div>
              <div>
                <p className="font-semibold text-slate-900">College</p>
                <p className="text-sm text-slate-500">e.g., NIT Warangal, IIT Hyderabad</p>
              </div>
            </div>
            <div className="ml-3 border-l-2 border-slate-200 pl-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-xs font-bold text-blue-700 mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-slate-900">Programs</p>
                  <p className="text-sm text-slate-500">B.Tech (4 years, 8 semesters), M.Tech (2 years, 4 semesters), etc.</p>
                </div>
              </div>
              <div className="ml-6 border-l-2 border-slate-200 pl-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center text-xs font-bold text-emerald-700 mt-0.5">3</div>
                  <div>
                    <p className="font-semibold text-slate-900">Branches</p>
                    <p className="text-sm text-slate-500">CSE, ECE, EEE, Mechanical, Civil, AI & ML, etc.</p>
                  </div>
                </div>
                <div className="ml-6 border-l-2 border-slate-200 pl-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center text-xs font-bold text-amber-700 mt-0.5">4</div>
                    <div>
                      <p className="font-semibold text-slate-900">Sections & Batches</p>
                      <p className="text-sm text-slate-500">CSE-A, CSE-B, CSE-C | Batch 2020-2024, 2021-2025</p>
                    </div>
                  </div>
                  <div className="ml-6 border-l-2 border-slate-200 pl-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-rose-100 rounded flex items-center justify-center text-xs font-bold text-rose-700 mt-0.5">5</div>
                      <div>
                        <p className="font-semibold text-slate-900">Subjects & Units</p>
                        <p className="text-sm text-slate-500">Subjects assigned per semester with unit breakdown</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">❓</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Do I need to sign up to view materials?", a: "No! You can browse and view all public materials without creating an account. Signup is only needed for downloading, bookmarking, and uploading." },
              { q: "Is GetMaterials free?", a: "Yes, GetMaterials is completely free for all students and teachers. We believe education should be accessible to everyone." },
              { q: "How do I find materials for my specific college?", a: "If your college is registered, you'll see college-specific materials when you sign in. These are organized by your college's programs, branches, and semesters." },
              { q: "Can students upload materials?", a: "Yes! Students can upload materials too. However, student uploads go through a review process before being published to maintain quality." },
              { q: "What file formats are supported?", a: "We support PDFs, images, video links (YouTube, etc.), external links, and assignment files. The maximum file size is 25MB per attachment." },
              { q: "How do I become a teacher on GetMaterials?", a: "Create an account, go to Settings, and request a role change to Teacher. Our admin team will review and approve your request, usually within 24 hours." },
            ].map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
