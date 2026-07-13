export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 2,
  backoffMs = 1000
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      if (attempt < retries && res.status >= 500) {
        await new Promise(r => setTimeout(r, backoffMs * (attempt + 1)));
        continue;
      }
      return res;
    } catch {
      if (attempt === retries) throw new Error(`Failed after ${retries + 1} attempts`);
      await new Promise(r => setTimeout(r, backoffMs * (attempt + 1)));
    }
  }
  throw new Error(`Failed after ${retries + 1} attempts`);
}
