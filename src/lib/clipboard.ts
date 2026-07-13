export async function clipboardWrite(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard access denied or unavailable — silently fail
  }
}
