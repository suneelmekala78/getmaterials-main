import mongoose, { Schema, Document } from "mongoose";

export type QuizKind = "subject" | "general_knowledge" | "other";

export interface IQuiz extends Document {
  title: string;
  slug?: string;
  description?: string;
  kind: QuizKind;
  chapter?: mongoose.Types.ObjectId | null;
  subject?: mongoose.Types.ObjectId | null;
  thumbnailUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }[];
  duration: number;
  passingScore: number;
  attempts: number;
  isActive: boolean;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, sparse: true, unique: true, index: true },
    description: { type: String, maxlength: 500 },
    kind: {
      type: String,
      enum: ["subject", "general_knowledge", "other"],
      default: "subject",
    },
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", default: null },
    thumbnailUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true },
        explanation: { type: String },
      },
    ],
    duration: { type: Number, required: true, min: 1 },
    passingScore: { type: Number, required: true, min: 0, max: 100 },
    attempts: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuizSchema.index({ subject: 1, chapter: 1 });
QuizSchema.index({ kind: 1, isActive: 1 });
QuizSchema.index({ createdBy: 1 });

export const Quiz =
  mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);

export interface IQuizAttempt extends Document {
  quiz: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  /** Elapsed seconds from start to submit (lower is better on ties). */
  timeSpentSeconds?: number;
  rating?: number;
  flagWrongKey?: boolean;
  feedbackNote?: string;
  completedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  quiz: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answers: [{ type: Number }],
  score: { type: Number, required: true },
  timeSpentSeconds: { type: Number, min: 0 },
  rating: { type: Number, min: 1, max: 5 },
  flagWrongKey: { type: Boolean, default: false },
  feedbackNote: { type: String, maxlength: 1000 },
  completedAt: { type: Date, default: Date.now },
});

QuizAttemptSchema.index({ quiz: 1, user: 1 });
QuizAttemptSchema.index({ user: 1 });

export const QuizAttempt =
  mongoose.models.QuizAttempt ||
  mongoose.model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);
