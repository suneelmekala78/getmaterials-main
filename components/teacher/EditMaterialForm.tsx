"use client";

import { UploadForm, type InitialMaterial } from "@/components/teacher/UploadForm";

interface Subject {
  id: string;
  name: string;
  slug: string;
}

interface Chapter {
  id: string;
  title: string;
  subject: string;
}

interface College {
  id: string;
  name: string;
  code: string;
  programs: { key: string; label: string; durationYears: number; totalSemesters: number }[];
  branches: { program: string; name: string; sections: string[] }[];
}

export function EditMaterialForm({
  material,
  subjects,
  chapters,
  colleges,
  userRole = "teacher",
  successRedirect = "/teacher/materials",
}: {
  material: InitialMaterial;
  subjects: Subject[];
  chapters: Chapter[];
  colleges: College[];
  userRole?: string;
  successRedirect?: string;
}) {
  return (
    <UploadForm
      key={material.id}
      subjects={subjects}
      chapters={chapters}
      colleges={colleges}
      userRole={userRole}
      successRedirect={successRedirect}
      initialMaterial={material}
    />
  );
}
