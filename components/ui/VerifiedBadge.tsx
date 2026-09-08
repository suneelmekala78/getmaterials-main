const GOLD = "#E8B923";
const GREEN = "#10B981";

export function isAdminRole(role?: string | null) {
  return role === "admin" || role === "college_admin";
}

export function showVerifiedBadge(role?: string | null, verified?: boolean | null) {
  return isAdminRole(role) || role === "teacher" || Boolean(verified);
}

/** Website BadgeCheck — gold for admins, green for teachers; white check always visible. */
export function VerifiedBadge({
  role,
  verified,
  className = "w-4 h-4",
}: {
  role?: string | null;
  verified?: boolean | null;
  className?: string;
}) {
  if (!showVerifiedBadge(role, verified)) return null;
  const fill = isAdminRole(role) ? GOLD : GREEN;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0`}
      aria-label={isAdminRole(role) ? "Admin verified" : "Verified"}
      role="img"
    >
      <path
        d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
        fill={fill}
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="#FFFFFF"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
