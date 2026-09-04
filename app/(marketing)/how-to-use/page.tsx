import type { Metadata } from "next";
import { listingMetadata } from "@/lib/seo";

const faqs = [
  { q: "Do I need to sign up to view materials?", a: "No. You can browse and view public materials without an account. Sign in to take quizzes, bookmark, upload, and track downloads." },
  { q: "Is GetMaterials free?", a: "Yes. GetMaterials is free for students and teachers." },
  { q: "How do I find materials for my college?", a: "Open Colleges, find your campus, or filter Materials by college. College-only uploads are visible after you sign in." },
  { q: "Can students upload materials?", a: "Yes. Students can upload from Upload. Those files go through review before they are published." },
  { q: "Where do I add a thumbnail vs a PDF?", a: "On Upload, step 2 is the cover image (listing banner). Step 3 is study files and links — PDFs, videos, and URLs students will open." },
  { q: "How do quizzes work?", a: "Students start a quiz from Quizzes. Teachers create, edit, and delete quizzes from Quizzes in the header, and can view student responses." },
  { q: "What file formats are supported?", a: "PDFs, images, video files or YouTube links, documents, and web links. Max size is 100MB per study file. Cover images should be under 5MB." },
  { q: "How do I become a teacher on GetMaterials?", a: "Create an account, go to Settings, and request a role change to Teacher. We review requests, usually within 24 hours." },
];

export const metadata: Metadata = listingMetadata({
  title: "How to Use GetMaterials",
  description:
    "Learn how to browse materials, take quizzes, upload files, and use GetMaterials on web and mobile.",
  path: "/how-to-use",
});

export default function HowToUsePage() {
  return (
    <main className="py-16 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            How to Use <span className="text-[var(--primary)]">GetMaterials</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Find study materials, take quizzes, and share notes with your college.
            Use the header to open Materials, Colleges, Quizzes, Upload, or your profile.
          </p>
        </div>

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
                  Open <strong>Materials</strong> in the header. Filter by subject, type (PDF, video, link), category, college, or semester.
                  Switch between grid and list view. You can browse public materials without signing in.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-500">
                    💡 <strong>Tip:</strong> Open a material to read About, Topics, Preview, Videos, and Reviews in one page.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Find Your College</h3>
                <p className="text-slate-600 mb-3">
                  Go to <strong>Colleges</strong> to see institutions on GetMaterials. Filter by location, program, or branch,
                  then open a college to view materials shared for that campus.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Take Quizzes</h3>
                <p className="text-slate-600 mb-3">
                  Sign in and open <strong>Quizzes</strong>. Filter by subject, search, and start a quiz.
                  Your progress, average score, and best score appear on the right. Use <strong>My Quizzes</strong> to revisit quizzes you already attempted.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-violet-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Your Account</h3>
                <p className="text-slate-600 mb-3">
                  After login, click your avatar to open the profile menu: Dashboard, My Materials, Upload, Quizzes, Bookmarks, and Settings.
                  Use <strong>Upload</strong> to share notes. Student uploads go through review before they are published.
                </p>
              </div>
            </div>
          </div>
        </section>

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
                  Sign up, then request a role change to Teacher from Settings. After approval, Upload and Quizzes appear in the header and profile menu.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Materials</h3>
                <p className="text-slate-600 mb-3">
                  Open <strong>Upload</strong> and fill in title, subject, chapter, and who can see it (Public or College Only).
                  Then add files in two separate steps:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 mb-3">
                  <li><strong>Cover image (optional):</strong> thumbnail or banner shown on material cards. Students do not download this as a study file.</li>
                  <li><strong>Study files & links:</strong> PDFs, documents, images, YouTube videos, or web links that students will actually open.</li>
                </ul>
                <p className="text-slate-600">
                  Save as Draft, or publish. Teacher uploads go live; student uploads wait for review.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Create and Manage Quizzes</h3>
                <p className="text-slate-600 mb-3">
                  Open <strong>Quizzes</strong> in the header (or your profile menu) to see your quizzes.
                  Use <strong>Create Quiz</strong> to add MCQ questions, duration, and a passing score.
                  From the same page you can preview, view responses, edit, or delete a quiz.
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Your Materials</h3>
                <p className="text-slate-600">
                  Open My Materials from your profile to edit, replace files, change the cover image, or remove uploads.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">📱</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">On the Mobile App</h2>
          </div>
          <p className="text-slate-600 mb-4">
            The bottom tabs are Home, Categories, Upload, <strong>Quizzes</strong>, and Profile.
            Tap the menu icon (three bars) at the top left to open the sidebar for Saved, Downloads, Settings, and more.
            GetMaterials stays in the center of the home header.
          </p>
        </section>

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

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">❓</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
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
