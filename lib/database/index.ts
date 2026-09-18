import type { Model } from "mongoose";

import { User as UserModel, type IUser } from "./models/user";
import {
  College as CollegeModel,
  type ICollege,
  type ICollegeProgram,
  type ICollegeBranch,
  type ICollegeBatch,
} from "./models/college";
import { Subject as SubjectModel, type ISubject } from "./models/subject";
import { Chapter as ChapterModel, type IChapter } from "./models/chapter";
import {
  Material as MaterialModel,
  type IMaterial,
  type IAttachment,
  materialCollegeFilter,
} from "./models/material";
import {
  MaterialView as MaterialViewModel,
  type IMaterialView,
} from "./models/material-view";
import {
  Quiz as QuizModel,
  QuizAttempt as QuizAttemptModel,
  type IQuiz,
  type IQuizAttempt,
} from "./models/quiz";
import { Review as ReviewModel, type IReview } from "./models/review";
import { Follow as FollowModel, type IFollow } from "./models/follow";
import {
  Job as JobModel,
  JobApplication as JobApplicationModel,
  type IJob,
  type IJobApplication,
  type EmploymentType,
  type JobApplyMode,
  type ApplicationStatus,
} from "./models/job";

export { connectDB } from "./connection";
export { materialCollegeFilter };

// Each model file falls back to `mongoose.models.X` so hot reloads reuse the
// compiled model. That produces a union type whose call signatures mongoose
// cannot reconcile, so the public surface is pinned to Model<T> here.
export const User = UserModel as Model<IUser>;
export const College = CollegeModel as Model<ICollege>;
export const Subject = SubjectModel as Model<ISubject>;
export const Chapter = ChapterModel as Model<IChapter>;
export const Material = MaterialModel as Model<IMaterial>;
export const MaterialView = MaterialViewModel as Model<IMaterialView>;
export const Quiz = QuizModel as Model<IQuiz>;
export const QuizAttempt = QuizAttemptModel as Model<IQuizAttempt>;
export const Review = ReviewModel as Model<IReview>;
export const Follow = FollowModel as Model<IFollow>;
export const Job = JobModel as Model<IJob>;
export const JobApplication = JobApplicationModel as Model<IJobApplication>;

export type {
  IUser,
  ICollege,
  ICollegeProgram,
  ICollegeBranch,
  ICollegeBatch,
  ISubject,
  IChapter,
  IMaterial,
  IAttachment,
  IMaterialView,
  IQuiz,
  IQuizAttempt,
  IReview,
  IFollow,
  IJob,
  IJobApplication,
  EmploymentType,
  JobApplyMode,
  ApplicationStatus,
};
