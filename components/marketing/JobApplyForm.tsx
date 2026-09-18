"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { uploadBrowserFile } from "@/lib/upload-file";
import {
  resolveAvatarSrc,
  defaultAvatarSrc,
} from "@/components/profile/FittedPhoto";

const AVAILABILITY_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "custom", label: "Other / custom" },
];

const STUDYING_YEAR_OPTIONS = [
  { value: "1st year", label: "1st year" },
  { value: "2nd year", label: "2nd year" },
  { value: "3rd year", label: "3rd year" },
  { value: "4th year", label: "4th year" },
  { value: "5th year", label: "5th year" },
  { value: "Final year", label: "Final year" },
];

const fieldClass =
  "w-full min-w-0 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15 bg-white";

export default function JobApplyForm({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { data: session, status } = useSession();
  const [profileLoading, setProfileLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [savedResumes, setSavedResumes] = useState<
    { name: string; url: string; uploadedAt?: string }[]
  >([]);
  const [resumeMode, setResumeMode] = useState<"upload" | "saved">("upload");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [note, setNote] = useState("");
  const [availability, setAvailability] = useState("immediate");
  const [availabilityCustom, setAvailabilityCustom] = useState("");
  const [applicantType, setApplicantType] = useState<"" | "student" | "graduate">(
    "",
  );
  const [location, setLocation] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [studyingYear, setStudyingYear] = useState("");
  const [program, setProgram] = useState("");
  const [education, setEducation] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [profileRes, resumesRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/resumes"),
        ]);
        const data = await profileRes.json().catch(() => ({}));
        const resumesData = await resumesRes.json().catch(() => ({}));
        if (!cancelled && profileRes.ok) {
          const u = data.user || {};
          setName(u.name || session?.user?.name || "");
          setEmail(u.email || session?.user?.email || "");
          setPhone(u.phone || "");
          setAvatarUrl(u.avatar || (session?.user as any)?.image || "");
          setLinkedinUrl(u.social?.linkedin || "");
          const cp = u.careerProfile || {};
          if (cp.applicantType === "student" || cp.applicantType === "graduate") {
            setApplicantType(cp.applicantType);
          }
          if (cp.location) setLocation(String(cp.location));
          if (cp.graduationYear) setGraduationYear(String(cp.graduationYear));
          if (cp.studyingYear) setStudyingYear(String(cp.studyingYear));
          if (cp.program) setProgram(String(cp.program));
          if (cp.education) setEducation(String(cp.education));
          if (cp.availability) {
            const avail = String(cp.availability);
            const known = AVAILABILITY_OPTIONS.some((o) => o.value === avail);
            if (known) setAvailability(avail);
            else {
              setAvailability("custom");
              setAvailabilityCustom(avail);
            }
          }
        } else if (!cancelled) {
          setName(session?.user?.name || "");
          setEmail(session?.user?.email || "");
          setAvatarUrl((session?.user as any)?.image || "");
        }
        if (!cancelled && resumesRes.ok) {
          const list = (resumesData.resumes || []) as {
            name: string;
            url: string;
            uploadedAt?: string;
          }[];
          setSavedResumes(list);
          if (list.length > 0) setResumeMode("saved");
        }
      } catch {
        if (!cancelled) {
          setName(session?.user?.name || "");
          setEmail(session?.user?.email || "");
          setAvatarUrl((session?.user as any)?.image || "");
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, session]);

  if (status === "loading" || (status === "authenticated" && profileLoading)) {
    return (
      <p className="text-sm text-slate-500 inline-flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading your profile…
      </p>
    );
  }

  if (!session?.user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600 leading-relaxed">
          Sign in to apply for <span className="font-semibold text-slate-900">{title}</span>.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/careers/${slug}`)}`}
          className="inline-flex w-full items-center justify-center px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition"
        >
          Log in to apply
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-4 text-sm text-emerald-800 leading-relaxed">
        Application submitted. We&apos;ll review it and get back to you.
      </div>
    );
  }

  const onAvatarChange = async (file: File | null) => {
    if (!file) return;
    setAvatarUploading(true);
    try {
      const { fileUrl } = await uploadBrowserFile(file, "avatars");
      setAvatarUrl(fileUrl);
      toast.success("Photo uploaded");
    } catch (err: any) {
      toast.error(err.message || "Could not upload photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  const onResumeChange = async (file: File | null) => {
    if (!file) return;
    setResumeUploading(true);
    try {
      const { fileUrl } = await uploadBrowserFile(file, "resumes");
      setResumeUrl(fileUrl);
      setResumeName(file.name);
      setResumeMode("upload");
      try {
        const saveRes = await fetch("/api/user/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, url: fileUrl }),
        });
        const saveData = await saveRes.json().catch(() => ({}));
        if (saveRes.ok) {
          setSavedResumes(saveData.resumes || []);
        }
      } catch {
        /* non-blocking */
      }
      toast.success("Resume uploaded");
    } catch (err: any) {
      toast.error(err.message || "Could not upload resume");
    } finally {
      setResumeUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl.trim()) {
      toast.error("Please upload a resume or paste a resume URL");
      return;
    }
    if (!applicantType) {
      toast.error("Please select Student or Graduate");
      return;
    }
    setSubmitting(true);
    try {
      const availabilityValue =
        availability === "custom"
          ? availabilityCustom.trim() || "custom"
          : availability;

      if (saveToProfile) {
        try {
          await fetch("/api/user/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: name.trim() || undefined,
              socialLinkedin: linkedinUrl.trim(),
              careerProfile: {
                applicantType,
                location: location.trim(),
                graduationYear:
                  applicantType === "graduate" ? graduationYear.trim() : "",
                studyingYear:
                  applicantType === "student" ? studyingYear.trim() : "",
                program: applicantType === "student" ? program.trim() : "",
                education:
                  applicantType === "graduate"
                    ? education.trim()
                    : program.trim(),
                availability: availabilityValue,
              },
            }),
          });
        } catch {
          /* non-blocking — still submit application */
        }
      }

      const res = await fetch(`/api/jobs/${encodeURIComponent(slug)}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim() || undefined,
          coverNote: coverNote.trim() || undefined,
          resumeUrl: resumeUrl.trim(),
          resumeName: resumeName.trim() || undefined,
          linkedinUrl: linkedinUrl.trim() || undefined,
          note: note.trim() || undefined,
          availability: availabilityValue || undefined,
          location: location.trim() || undefined,
          graduationYear:
            applicantType === "graduate"
              ? graduationYear.trim() || undefined
              : undefined,
          studyingYear:
            applicantType === "student"
              ? studyingYear.trim() || undefined
              : undefined,
          program:
            applicantType === "student" ? program.trim() || undefined : undefined,
          education:
            applicantType === "graduate"
              ? education.trim() || undefined
              : program.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          applicantType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit application");
      setDone(true);
      toast.success(
        saveToProfile
          ? "Application submitted — details saved to your profile"
          : "Application submitted",
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  const avatarSrc = resolveAvatarSrc(avatarUrl) || defaultAvatarSrc();

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-violet-50/80 to-slate-50/60 p-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Your profile</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover border border-white shadow-sm bg-white"
              />
              <label className="absolute -bottom-1 -right-1 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 cursor-pointer hover:text-[var(--primary)] shadow-sm">
                {avatarUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={avatarUploading}
                  onChange={(e) => onAvatarChange(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use a clear photo — recruiters see this with your application.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className={`${fieldClass} bg-slate-100 text-slate-600 cursor-not-allowed focus:ring-0`}
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          Phone
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
          placeholder="10-digit mobile"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          Resume <span className="text-red-500 normal-case">*</span>
        </label>
        {savedResumes.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => setResumeMode("saved")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                resumeMode === "saved"
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              Previous resumes
            </button>
            <button
              type="button"
              onClick={() => setResumeMode("upload")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                resumeMode === "upload"
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              Upload new
            </button>
          </div>
        ) : null}
        {resumeMode === "saved" && savedResumes.length > 0 ? (
          <div className="space-y-2">
            {savedResumes.map((r) => (
              <label
                key={r.url}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                  resumeUrl === r.url
                    ? "border-violet-400 bg-violet-50/60"
                    : "border-slate-200 hover:border-violet-200"
                }`}
              >
                <input
                  type="radio"
                  name="saved-resume"
                  checked={resumeUrl === r.url}
                  onChange={() => {
                    setResumeUrl(r.url);
                    setResumeName(r.name);
                  }}
                  className="text-violet-600 focus:ring-violet-500"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{r.url}</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-semibold text-slate-600 hover:border-[var(--primary)] hover:text-[var(--primary)] cursor-pointer bg-white">
              {resumeUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {resumeUploading ? "Uploading…" : "Upload resume (PDF / DOC)"}
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf"
                className="hidden"
                disabled={resumeUploading}
                onChange={(e) => onResumeChange(e.target.files?.[0] || null)}
              />
            </label>
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => {
                setResumeUrl(e.target.value);
                setResumeName("");
              }}
              required={resumeMode !== "saved"}
              className={fieldClass}
              placeholder="Or paste resume URL"
            />
          </div>
        )}
        {resumeMode === "saved" && !resumeUrl ? (
          <p className="mt-1 text-xs text-amber-600">Select a saved resume to continue.</p>
        ) : null}
        {resumeUrl && resumeMode === "upload" ? (
          <p className="mt-1 text-xs text-slate-500 truncate">
            Selected: {resumeName || resumeUrl}
          </p>
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          LinkedIn URL <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <input
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          className={fieldClass}
          placeholder="https://linkedin.com/in/…"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          Location
        </label>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={fieldClass}
          placeholder="City / town (e.g. Hyderabad)"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          I am a <span className="text-red-500 normal-case">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "student", label: "Student" },
              { value: "graduate", label: "Graduate" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setApplicantType(opt.value)}
              className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
                applicantType === opt.value
                  ? "border-violet-400 bg-violet-50 text-violet-800"
                  : "border-slate-200 text-slate-600 hover:border-violet-200 bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {applicantType === "student" ? (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Studying year
            </label>
            <select
              value={studyingYear}
              onChange={(e) => setStudyingYear(e.target.value)}
              className={fieldClass}
            >
              <option value="">Select year</option>
              {STUDYING_YEAR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Program
            </label>
            <input
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className={fieldClass}
              placeholder="e.g. B.Tech CSE"
            />
          </div>
        </div>
      ) : null}

      {applicantType === "graduate" ? (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Graduation year
            </label>
            <input
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className={fieldClass}
              placeholder="e.g. 2024"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Degree / qualification
            </label>
            <input
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className={fieldClass}
              placeholder="e.g. B.Tech CSE"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          Availability
        </label>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className={fieldClass}
        >
          {AVAILABILITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {availability === "custom" ? (
          <input
            value={availabilityCustom}
            onChange={(e) => setAvailabilityCustom(e.target.value)}
            className={`${fieldClass} mt-2`}
            placeholder="e.g. After exams in May"
          />
        ) : null}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          Note to recruiter <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={2}
          maxLength={2000}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={`${fieldClass} resize-none`}
          placeholder="Anything we should know?"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
          Cover note <span className="font-normal normal-case text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={4}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          className={`${fieldClass} resize-none`}
          placeholder="Why are you a good fit?"
        />
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-3 cursor-pointer">
        <input
          type="checkbox"
          checked={saveToProfile}
          onChange={(e) => setSaveToProfile(e.target.checked)}
          className="mt-0.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-sm text-slate-700 leading-snug">
          <span className="font-semibold text-slate-900">Save these details</span>{" "}
          to my profile for future applications
        </span>
      </label>

      <button
        type="submit"
        disabled={submitting || resumeUploading}
        className="inline-flex w-full items-center justify-center px-6 py-3.5 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 shadow-sm shadow-violet-200"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
