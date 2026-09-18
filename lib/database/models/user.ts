import mongoose, { Schema, Document } from "mongoose";

export interface IPushDevice {
  pushToken: string;
  platform: "android" | "ios";
  deviceName: string;
  createdAt: Date;
}

export interface IMaterialHistoryItem {
  material: mongoose.Types.ObjectId;
  at: Date;
}

export interface IUserResume {
  name: string;
  url: string;
  uploadedAt: Date;
}

export interface IUser extends Document {
  email: string;
  phone?: string;
  name: string;
  slug?: string;
  previousSlugs?: string[];
  password?: string;
  avatar?: string;
  banner?: string;
  avatarPos?: { x: number; y: number; zoom: number };
  bannerPos?: { x: number; y: number; zoom: number };
  role: "student" | "teacher" | "college_admin" | "admin";
  status: "active" | "pending" | "suspended";
  college?: mongoose.Types.ObjectId;
  assignedColleges: mongoose.Types.ObjectId[];
  bio?: string;
  qualifications?: string;
  skills: string[];
  interests: string[];
  social?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  appleId?: string;
  googleId?: string;
  bookmarks: mongoose.Types.ObjectId[];
  savedJobs: mongoose.Types.ObjectId[];
  resumes?: IUserResume[];
  careerProfile?: {
    applicantType?: "student" | "graduate";
    graduationYear?: string;
    education?: string;
    availability?: string;
    location?: string;
    studyingYear?: string;
    program?: string;
  };
  downloadHistory: IMaterialHistoryItem[];
  viewHistory: IMaterialHistoryItem[];
  pushDevices: IPushDevice[];
  emailVerified?: Date;
  phoneVerified?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  deletionRequestedAt?: Date;
  deletionReason?: string;
  deletionCancellations: {
    requestedAt: Date;
    reason?: string;
    cancelledAt: Date;
    cancelledBy: "admin" | "user";
    cancelReason?: string;
    cancelledByAdmin?: mongoose.Types.ObjectId;
  }[];
  signupMeta?: {
    platform: "website" | "android" | "ios" | "unknown";
    userAgent?: string;
    device?: string;
    ip?: string;
    country?: string;
    city?: string;
    region?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, sparse: true, unique: true, index: true },
    previousSlugs: [{ type: String, trim: true, lowercase: true }],
    password: { type: String, select: false },
    avatar: { type: String },
    banner: { type: String },
    avatarPos: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
      zoom: { type: Number, default: 1 },
    },
    bannerPos: {
      x: { type: Number, default: 50 },
      y: { type: Number, default: 50 },
      zoom: { type: Number, default: 1 },
    },
    appleId: { type: String, sparse: true, unique: true, index: true },
    googleId: { type: String, sparse: true, unique: true, index: true },
    role: {
      type: String,
      enum: ["student", "teacher", "college_admin", "admin"],
      default: "student",
    },
    status: {
      type: String,
      enum: ["active", "pending", "suspended"],
      default: "active",
    },
    college: { type: Schema.Types.ObjectId, ref: "College" },
    assignedColleges: [{ type: Schema.Types.ObjectId, ref: "College" }],
    bio: { type: String, maxlength: 500 },
    qualifications: { type: String, maxlength: 500 },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    social: {
      linkedin: { type: String, trim: true, maxlength: 300 },
      github: { type: String, trim: true, maxlength: 300 },
      twitter: { type: String, trim: true, maxlength: 300 },
      instagram: { type: String, trim: true, maxlength: 300 },
      youtube: { type: String, trim: true, maxlength: 300 },
      website: { type: String, trim: true, maxlength: 300 },
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Material" }],
    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
    resumes: [
      {
        name: { type: String, required: true, trim: true, maxlength: 200 },
        url: { type: String, required: true, trim: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    careerProfile: {
      applicantType: {
        type: String,
        enum: ["student", "graduate"],
      },
      graduationYear: { type: String, trim: true, maxlength: 20 },
      education: { type: String, trim: true, maxlength: 200 },
      availability: { type: String, trim: true, maxlength: 200 },
      location: { type: String, trim: true, maxlength: 200 },
      studyingYear: { type: String, trim: true, maxlength: 50 },
      program: { type: String, trim: true, maxlength: 200 },
    },
    downloadHistory: [
      {
        material: { type: Schema.Types.ObjectId, ref: "Material", required: true },
        at: { type: Date, default: Date.now },
      },
    ],
    viewHistory: [
      {
        material: { type: Schema.Types.ObjectId, ref: "Material", required: true },
        at: { type: Date, default: Date.now },
      },
    ],
    pushDevices: [
      {
        pushToken: { type: String, required: true },
        platform: { type: String, enum: ["android", "ios"], required: true },
        deviceName: { type: String, default: "Unknown Device" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    emailVerified: { type: Date },
    phoneVerified: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    deletionRequestedAt: { type: Date },
    deletionReason: { type: String, maxlength: 1000 },
    deletionCancellations: [
      {
        requestedAt: { type: Date, required: true },
        reason: { type: String, maxlength: 1000 },
        cancelledAt: { type: Date, required: true },
        cancelledBy: {
          type: String,
          enum: ["admin", "user"],
          required: true,
        },
        cancelReason: { type: String, maxlength: 1000 },
        cancelledByAdmin: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    signupMeta: {
      platform: {
        type: String,
        enum: ["website", "android", "ios", "unknown"],
        default: "unknown",
      },
      userAgent: { type: String },
      device: { type: String },
      ip: { type: String },
      country: { type: String },
      city: { type: String },
      region: { type: String },
    },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ college: 1 });
UserSchema.index({ previousSlugs: 1 });

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
