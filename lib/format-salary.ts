/** Format salary/stipend for display with a rupee symbol when missing. */
export function formatSalaryINR(value?: string | null): string | null {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/[₹]|^\s*Rs\.?\b|INR\b/i.test(raw)) return raw;
  // Prefer prefixing amounts / ranges that start with a digit
  if (/^\d/.test(raw)) return `₹${raw}`;
  return `₹ ${raw}`;
}
