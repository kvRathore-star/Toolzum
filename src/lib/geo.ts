export function isIndiaFromCookie(): boolean {
  if (typeof window === "undefined") return false;
  const cookies = document.cookie.split(";");
  const cc = cookies.find((c) => c.trim().startsWith("user-country="));
  return cc?.split("=")[1] === "IN";
}

export function isIndiaFromTz(): boolean {
  if (typeof window === "undefined") return false;
  return Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata";
}

let cachedIpSuccess: boolean | null = null;

export async function isIndiaFromIp(): Promise<boolean> {
  if (cachedIpSuccess !== null) return cachedIpSuccess;
  const tryFetch = async (url: string): Promise<string | null> => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return await res.text();
    } catch {
      return null;
    }
  };
  const sources = [
    async () => {
      const text = await tryFetch("/api/geo-country");
      if (!text) return null;
      try {
        const data = JSON.parse(text);
        return data.country === "IN";
      } catch { return null; }
    },
    async () => {
      const text = await tryFetch("https://ipwho.is/?fields=country_code");
      if (!text) return null;
      try {
        const data = JSON.parse(text);
        return data.country_code === "IN";
      } catch { return null; }
    },
  ];
  for (const source of sources) {
    const result = await source();
    if (result === true) {
      cachedIpSuccess = true;
      return true;
    }
  }
  return false;
}
