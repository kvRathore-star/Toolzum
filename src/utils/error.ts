export function getErrorMessage(e: unknown, fallback = 'An error occurred'): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  if (e && typeof e === 'object' && 'message' in e && typeof (e as Record<string, unknown>).message === 'string') {
    return (e as Record<string, string>).message!;
  }
  try {
    return JSON.stringify(e);
  } catch {
    return fallback;
  }
}
