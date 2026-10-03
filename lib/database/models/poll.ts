import mongoose, { Schema, Document } from "mongoose";

export interface IPoll extends Document {
  question: string;
  slug?: string;
  description?: string;
  type: "rating" | "yes_no" | "multiple_choice" | "text";
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PollSchema = new Schema<IPoll>(
  {
    question: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, sparse: true, unique: true, index: true },
    description: { type: String, maxlength: 500 },
    type: {
      type: String,
      enum: ["rating", "yes_no", "multiple_choice", "text"],
      required: true,
    },
    thumbnailUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "polls" },
);

export const Poll = mongoose.models.Poll || mongoose.model<IPoll>("Poll", PollSchema);
