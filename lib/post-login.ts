import { reportLoginDevice } from "@/lib/device-id";
import { trackSignUp, type SignUpMethod } from "@/lib/analytics";

/** Sends a freshly signed-in user to the right place: teacher home, study setup, or callbackUrl. */
export async function redirectAfterLogin(method?: SignUpMethod) {
  await reportLoginDevice();
  const sessionRes = await fetch("/api/auth/session");
  const sessionData = await sessionRes.json().catch(() => null);
  const user = sessionData?.user;

  if (method && user?.isNewUser && user?.id) {
    const key = `gm-signup-tracked-${user.id}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, "1");
      await trackSignUp(method);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const callback = params.get("callbackUrl") || "";
  const safeNext = callback.startsWith("/") && !callback.startsWith("//") ? callback : "";

  if (user?.role === "teacher" && user?.status !== "pending") {
    window.location.href = "/teacher/dashboard";
    return;
  }
  if (user?.role !== "teacher" && user?.role !== "admin") {
    const profileRes = await fetch("/api/study/profile");
    if (profileRes.ok) {
      const data = await profileRes.json().catch(() => ({}));
      if (!data.profile?.completed && !data.profile?.dismissed) {
        const next = safeNext ? `?next=${encodeURIComponent(safeNext)}` : "";
        window.location.href = `/welcome${next}`;
        return;
      }
    }
  }
  window.location.href = safeNext || "/dashboard";
}
