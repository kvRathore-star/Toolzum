/**
 * Browser-side attachment helper shared by the admin inbox composer and
 * the standalone reply page — File objects → the base64 payload shape
 * /api/admin/reply expects ({ filename, content, mime }).
 *
 * Enforces the same limits the server validates, client-side first, so
 * the user gets an immediate, named error instead of a 400 after upload:
 * max 5 files, max 8 MB per file (matches reply.ts MAX_* constants).
 */

export interface ClientAttachment {
  filename: string;
  content: string;
  mime: string;
}

export const MAX_ATTACHMENT_FILES = 5;
export const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
// Mirrors reply.ts — the total cap keeps the encoded JSON body (three
// in-memory copies at send time) safely under the 128 MB Workers limit.
export const MAX_TOTAL_ATTACHMENT_BYTES = 12 * 1024 * 1024;

function b64FromBytes(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/**
 * Convert picked files to base64 attachments.
 * Throws with a per-file message when over the limits — callers surface
 * the error in their action-error UI, nothing is silently dropped.
 */
export async function filesToAttachments(files: File[]): Promise<ClientAttachment[]> {
  if (files.length > MAX_ATTACHMENT_FILES) {
    throw new Error(`Only ${MAX_ATTACHMENT_FILES} attachments per reply — pick fewer files`);
  }
  const out: ClientAttachment[] = [];
  let total = 0;
  for (const f of files) {
    if (f.size > MAX_ATTACHMENT_BYTES) {
      const mb = (f.size / (1024 * 1024)).toFixed(1);
      throw new Error(`"${f.name}" is ${mb} MB — the limit is 8 MB per file`);
    }
    total += f.size;
    if (total > MAX_TOTAL_ATTACHMENT_BYTES) {
      throw new Error(`Attachments exceed the 12 MB total limit`);
    }
    const bytes = new Uint8Array(await f.arrayBuffer());
    out.push({
      filename: f.name.slice(0, 200) || "attachment",
      content: b64FromBytes(bytes),
      mime: f.type || "application/octet-stream",
    });
  }
  return out;
}
