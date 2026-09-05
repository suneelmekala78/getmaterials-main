export const ACCOUNT_DELETION_REASONS = [
  { id: "not_useful", label: "I no longer find GetMaterials useful" },
  { id: "privacy", label: "Privacy concerns" },
  { id: "duplicate", label: "I have another account" },
  { id: "too_hard", label: "The app/site is hard to use" },
  { id: "teacher_issues", label: "Problems uploading or managing materials" },
  { id: "other", label: "Other" },
] as const;

export type DeletionReasonId = (typeof ACCOUNT_DELETION_REASONS)[number]["id"];

export const ACCOUNT_DELETION_DATA_NOTICE = [
  "Your user account and login",
  "Materials you uploaded (and reviews/views/bookmarks on those materials)",
  "Quizzes you created and attempts on them",
  "Your quiz attempts, reviews, and follow links",
  "Teacher role requests and your poll responses",
];
