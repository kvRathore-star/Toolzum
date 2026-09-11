export async function clipboardWrite(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard access denied or unavailable — caller shows the fallback.
    // Returns false so UIs never claim a copy that did not happen.
    return false;
  }
}
