const KEY = "gm_device_id";

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function deviceNameFromUa(): string {
  if (typeof navigator === "undefined") return "Web browser";
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
  return "Web browser";
}

export async function reportLoginDevice() {
  const deviceId = getOrCreateDeviceId();
  if (!deviceId) return;
  try {
    await fetch("/api/user/login-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId,
        deviceName: deviceNameFromUa(),
      }),
    });
  } catch {
    // non-blocking
  }
}
