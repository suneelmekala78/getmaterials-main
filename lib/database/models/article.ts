import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverUrl?: string;
  tags: string[];
  subject?: mongoose.Types.ObjectId | null;
  program?: string;
  author: mongoose.Types.ObjectId;
  status: 'draft' | 'published';
  views: number;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    excerpt: { type: String, trim: true, maxlength: 500, default: '' },
    bodyHtml: { type: String, required: true },
    coverUrl: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    program: { type: String, trim: true, lowercase: true, maxlength: 50, default: '' },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ArticleSchema.index({ status: 1, publishedAt: -1 });
ArticleSchema.index({ tags: 1, status: 1 });

export const Article =
  mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
