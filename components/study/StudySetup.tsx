"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, GraduationCap } from "lucide-react";

type Option = { id: string; label: string };
type Program = { key: string; label: string; durationYears: number; totalSemesters: number };
type Branch = { name: string; sections: string[] };

const STEPS = ["College", "Course", "Branch", "Year", "Semester", "Section", "Subjects"];

function ChoiceGrid({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition ${
              selected
                ? "border-violet-500 bg-violet-50 text-violet-800"
                : "border-slate-200 bg-white text-slate-800 hover:border-violet-200"
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              {option.label}
              {selected ? <Check className="w-4 h-4" /> : null}
            </span>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onChange("other")}
        className={`text-left px-4 py-3 rounded-2xl border text-sm font-semibold transition ${
          value === "other"
            ? "border-violet-500 bg-violet-50 text-violet-800"
            : "border-dashed border-slate-300 text-slate-600 hover:border-violet-200"
        }`}
      >
        Other — type it so we can add it
      </button>
    </div>
  );
}

export function StudySetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [colleges, setColleges] = useState<Option[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<Option[]>([]);
  const [collegeId, setCollegeId] = useState("");
  const [collegeOther, setCollegeOther] = useState("");
  const [program, setProgram] = useState("");
  const [programOther, setProgramOther] = useState("");
  const [branch, setBranch] = useState("");
  const [branchOther, setBranchOther] = useState("");
  const [year, setYear] = useState("");
  const [yearOther, setYearOther] = useState("");
  const [semester, setSemester] = useState("");
  const [semesterOther, setSemesterOther] = useState("");
  const [section, setSection] = useState("");
  const [sectionOther, setSectionOther] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [subjectDraft, setSubjectDraft] = useState("");
  const [subjectOthers, setSubjectOthers] = useState<string[]>([]);

  const branchSections = useMemo(() => {
    const match = branches.find((item) => item.name === branch);
    return match?.sections?.length ? match.sections : ["A", "B", "C", "D"];
  }, [branches, branch]);

  useEffect(() => {
    fetch("/api/study/profile")
      .then((res) => res.json())
      .then((data) => {
        const profile = data.profile;
        if (!profile) return;
        setCollegeId(profile.collegeId || (profile.collegeOther ? "other" : ""));
        setCollegeOther(profile.collegeOther || "");
        setProgram(profile.program || (profile.programOther ? "other" : ""));
        setProgramOther(profile.programOther || "");
        setBranch(profile.branch || (profile.branchOther ? "other" : ""));
        setBranchOther(profile.branchOther || "");
        setYear(profile.year ? String(profile.year) : profile.yearOther ? "other" : "");
        setYearOther(profile.yearOther || "");
        setSemester(profile.semester ? String(profile.semester) : profile.semesterOther ? "other" : "");
        setSemesterOther(profile.semesterOther || "");
        setSection(profile.section || (profile.sectionOther ? "other" : ""));
        setSectionOther(profile.sectionOther || "");
        setSubjectIds(profile.subjectIds || []);
        setSubjectOthers(profile.subjectOthers || []);
      })
      .catch(() => {})
      .finally(() => setProfileLoaded(true));
  }, []);

  useEffect(() => {
    if (!profileLoaded) return;
    const params = new URLSearchParams();
    if (collegeId && collegeId !== "other") params.set("collegeId", collegeId);
    if (program && program !== "other") params.set("program", program);
    fetch(`/api/study/options?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setColleges((data.colleges || []).map((item: any) => ({
          id: item.id,
          label: item.code ? `${item.name} (${item.code})` : item.name,
        })));
        setPrograms(data.programs || []);
        setBranches(data.branches || []);
        setYears(data.years || []);
        setSemesters(data.semesters || []);
        setSubjects((data.subjects || []).map((item: any) => ({ id: item.id, label: item.name })));
      })
      .catch(() => setError("Could not load colleges"))
      .finally(() => setLoading(false));
  }, [profileLoaded, collegeId, program]);

  const payload = (completed: boolean, dismissed: boolean) => ({
    collegeId: collegeId === "other" ? "" : collegeId,
    collegeOther: collegeId === "other" ? collegeOther : "",
    program: program === "other" ? "" : program,
    programOther: program === "other" ? programOther : "",
    branch: branch === "other" ? "" : branch,
    branchOther: branch === "other" ? branchOther : "",
    year: year === "other" ? null : Number(year) || null,
    yearOther: year === "other" ? yearOther : "",
    semester: semester === "other" ? null : Number(semester) || null,
    semesterOther: semester === "other" ? semesterOther : "",
    section: section === "other" ? "" : section,
    sectionOther: section === "other" ? sectionOther : "",
    subjectIds,
    subjectOthers,
    completed,
    dismissed,
  });

  const save = async (completed: boolean, dismissed: boolean) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/study/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(completed, dismissed)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save");
      const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      router.push(dest);
    } catch (err: any) {
      setError(err.message || "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const canContinue = () => {
    if (step === 0) return (collegeId && collegeId !== "other") || collegeOther.trim().length > 1;
    if (step === 1) return (program && program !== "other") || programOther.trim().length > 1;
    if (step === 2) return (branch && branch !== "other") || branchOther.trim().length > 1;
    if (step === 3) return (year && year !== "other") || yearOther.trim().length > 0;
    if (step === 4) return (semester && semester !== "other") || semesterOther.trim().length > 0;
    if (step === 5) return (section && section !== "other") || sectionOther.trim().length > 0;
    return subjectIds.length > 0 || subjectOthers.length > 0;
  };

  const otherValue =
    step === 0 ? collegeOther :
    step === 1 ? programOther :
    step === 2 ? branchOther :
    step === 3 ? yearOther :
    step === 4 ? semesterOther :
    sectionOther;
  const otherSelected =
    (step === 0 && collegeId === "other") ||
    (step === 1 && program === "other") ||
    (step === 2 && branch === "other") ||
    (step === 3 && year === "other") ||
    (step === 4 && semester === "other") ||
    (step === 5 && section === "other");
  const setOther = (value: string) => {
    if (step === 0) setCollegeOther(value);
    else if (step === 1) setProgramOther(value);
    else if (step === 2) setBranchOther(value);
    else if (step === 3) setYearOther(value);
    else if (step === 4) setSemesterOther(value);
    else setSectionOther(value);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-sm font-semibold text-violet-700 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" /> Set up your campus
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          {STEPS[step]}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Step {step + 1} of {STEPS.length}. This tunes materials, quizzes, and your timetable.
        </p>
        <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-violet-600 transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading colleges…</p>
        ) : step === 6 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => {
                const on = subjectIds.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() =>
                      setSubjectIds((prev) =>
                        on ? prev.filter((id) => id !== subject.id) : [...prev, subject.id],
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                      on ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    {subject.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={subjectDraft}
                onChange={(event) => setSubjectDraft(event.target.value)}
                placeholder="Subject not listed"
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const name = subjectDraft.trim();
                  if (!name || subjectOthers.includes(name)) return;
                  setSubjectOthers((prev) => [...prev, name]);
                  setSubjectDraft("");
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold"
              >
                Add
              </button>
            </div>
            {subjectOthers.length > 0 && (
              <p className="text-xs text-slate-500">We’ll ask an admin to add: {subjectOthers.join(", ")}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <ChoiceGrid
              options={
                step === 0
                  ? colleges
                  : step === 1
                    ? programs.map((item) => ({ id: item.key, label: item.label }))
                    : step === 2
                      ? branches.map((item) => ({ id: item.name, label: item.name }))
                      : step === 3
                        ? years.map((item) => ({ id: String(item), label: `Year ${item}` }))
                        : step === 4
                          ? semesters.map((item) => ({ id: String(item), label: `Semester ${item}` }))
                          : branchSections.map((item) => ({ id: item, label: `Section ${item}` }))
              }
              value={
                step === 0 ? collegeId :
                step === 1 ? program :
                step === 2 ? branch :
                step === 3 ? year :
                step === 4 ? semester :
                section
              }
              onChange={(id) => {
                if (step === 0) setCollegeId(id);
                else if (step === 1) setProgram(id);
                else if (step === 2) setBranch(id);
                else if (step === 3) setYear(id);
                else if (step === 4) setSemester(id);
                else setSection(id);
              }}
            />
            {otherSelected && (
              <input
                value={otherValue}
                onChange={(event) => setOther(event.target.value)}
                placeholder="Type the name"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
              />
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

        <div className="flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => save(false, true)}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-50"
          >
            Skip for now
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((value) => value - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                disabled={!canContinue()}
                onClick={() => setStep((value) => value + 1)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-40"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={saving || !canContinue()}
                onClick={() => save(true, false)}
                className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save and continue"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
