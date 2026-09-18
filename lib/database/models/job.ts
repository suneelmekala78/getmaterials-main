import mongoose, { Schema, Document } from "mongoose";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "internship"
  | "contract"
  | "remote";

export type JobApplyMode = "internal" | "external";

export type JobLocationType = "onsite" | "remote" | "hybrid";

export type JobAudience = "student" | "graduate" | "any";

export interface IJob extends Document {
  title: string;
  slug: string;
  company: string;
  location: string;
  locationType: JobLocationType;
  employmentType: EmploymentType;
  salaryText?: string;
  audience: JobAudience;
  companyLogoUrl?: string;
  description: string;
  applyMode: JobApplyMode;
  externalUrl?: string;
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus = "pending" | "reviewed" | "rejected" | "hired";

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  coverNote?: string;
  resumeUrl?: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  /** Recruiter-facing note from applicant */
  note?: string;
  availability?: string;
  graduationYear?: number | string;
  education?: string;
  applicantType?: "student" | "graduate";
  location?: string;
  studyingYear?: string;
  program?: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    company: { type: String, trim: true, default: "GetMaterials" },
    location: { type: String, trim: true, default: "" },
    locationType: {
      type: String,
      enum: ["onsite", "remote", "hybrid"],
      default: "onsite",
    },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "internship", "contract", "remote"],
      default: "full_time",
    },
    salaryText: { type: String, trim: true, maxlength: 200 },
    audience: {
      type: String,
      enum: ["student", "graduate", "any"],
      default: "any",
    },
    companyLogoUrl: { type: String, trim: true },
    description: { type: String, default: "" },
    applyMode: {
      type: String,
      enum: ["internal", "external"],
      default: "internal",
    },
    externalUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

JobSchema.index({ isActive: 1, createdAt: -1 });

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    coverNote: { type: String, maxlength: 5000 },
    resumeUrl: { type: String, trim: true },
    avatarUrl: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    note: { type: String, maxlength: 2000 },
    availability: { type: String, trim: true, maxlength: 200 },
    graduationYear: { type: Schema.Types.Mixed },
    education: { type: String, trim: true, maxlength: 500 },
    applicantType: {
      type: String,
      enum: ["student", "graduate"],
    },
    location: { type: String, trim: true, maxlength: 200 },
    studyingYear: { type: String, trim: true, maxlength: 50 },
    program: { type: String, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ["pending", "reviewed", "rejected", "hired"],
      default: "pending",
    },
  },
  { timestamps: true },
);

JobApplicationSchema.index({ job: 1, user: 1 }, { unique: true });

export const Job =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
