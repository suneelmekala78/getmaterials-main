import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityTopic extends Document {
  key: string;
  label: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommunityThread extends Document {
  topic: mongoose.Types.ObjectId;
  title: string;
  body: string;
  author: mongoose.Types.ObjectId;
  subject?: mongoose.Types.ObjectId | null;
  college?: mongoose.Types.ObjectId | null;
  isSticky: boolean;
  isLocked: boolean;
  replyCount: number;
  lastReplyAt?: Date | null;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommunityReply extends Document {
  thread: mongoose.Types.ObjectId;
  body: string;
  author: mongoose.Types.ObjectId;
  upvotes: mongoose.Types.ObjectId[];
  reportCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityTopicSchema = new Schema<ICommunityTopic>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
    },
    label: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const CommunityThreadSchema = new Schema<ICommunityThread>(
  {
    topic: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityTopic',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 10000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', default: null },
    college: { type: Schema.Types.ObjectId, ref: 'College', default: null },
    isSticky: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    replyCount: { type: Number, default: 0 },
    lastReplyAt: { type: Date, default: null },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

CommunityThreadSchema.index({ topic: 1, isSticky: -1, lastReplyAt: -1, createdAt: -1 });
CommunityThreadSchema.index({ reportCount: -1 });

const CommunityReplySchema = new Schema<ICommunityReply>(
  {
    thread: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityThread',
      required: true,
      index: true,
    },
    body: { type: String, required: true, trim: true, maxlength: 8000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    reportCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

CommunityReplySchema.index({ thread: 1, createdAt: 1 });

export const CommunityTopic =
  mongoose.models.CommunityTopic ||
  mongoose.model<ICommunityTopic>('CommunityTopic', CommunityTopicSchema);

export const CommunityThread =
  mongoose.models.CommunityThread ||
  mongoose.model<ICommunityThread>('CommunityThread', CommunityThreadSchema);

export const CommunityReply =
  mongoose.models.CommunityReply ||
  mongoose.model<ICommunityReply>('CommunityReply', CommunityReplySchema);
