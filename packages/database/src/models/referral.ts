import mongoose, { Schema, Document } from "mongoose";

export interface IReferral extends Document {
  user: mongoose.Types.ObjectId;
  source: string; // instagram, youtube, twitter, google, direct, etc.
  medium: string; // social, organic, paid, referral, etc.
  campaign: string; // specific campaign name
  referrer: string; // who referred them (friend_a, influencer_xyz)
  referralCode: string; // custom short code (e.g., "suneel25")
  landingPage: string; // which page they first landed on
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: String, trim: true, lowercase: true, default: "direct" },
    medium: { type: String, trim: true, lowercase: true, default: "" },
    campaign: { type: String, trim: true, lowercase: true, default: "" },
    referrer: { type: String, trim: true, lowercase: true, default: "" },
    referralCode: { type: String, trim: true, lowercase: true, default: "" },
    landingPage: { type: String, default: "/" },
  },
  { timestamps: true }
);

ReferralSchema.index({ source: 1 });
ReferralSchema.index({ referrer: 1 });
ReferralSchema.index({ referralCode: 1 });
ReferralSchema.index({ createdAt: -1 });

export const Referral =
  mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema);
