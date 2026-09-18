import mongoose, { Schema, Document } from "mongoose";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "internship"
  | "contract"
  | "remote";

export type JobApplyMode = "internal" | "external";

export interface IJob extends Document {
  title: string;
  slug: string;
  company: string;
  location: string;
  employmentType: EmploymentType;
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
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "internship", "contract", "remote"],
      default: "full_time",
    },
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
