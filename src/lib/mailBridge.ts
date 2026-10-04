/**
 * Shared mail-bridge helpers — attachment download URL signing, used by
 * both the toolzum-mail-bridge Worker (verify) and the Pages admin API
 * (sign). HMAC-SHA256 over the KV key with a shared ATTACH_SECRET so
 * stored contact attachments are only downloadable with a fresh,
 * unguessable URL — the KV namespace itself is never publicly listable
 * and the worker rejects anything unsigned.
 */

export const MAIL_BRIDGE_DEFAULT_URL = "https://toolzum-mail-bridge.kirtivardhan1996.workers.dev";

export interface StoredAttachment {
  key: string;
  name: string;
  mime: string;
  size: number;
}

/** Parse the JSON attachments column defensively (corrupt data → []). */
export function parseAttachmentList(json: string | null | undefined): StoredAttachment[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a): a is StoredAttachment =>
        !!a &&
        typeof a === "object" &&
        typeof (a as StoredAttachment).key === "string" &&
        typeof (a as StoredAttachment).name === "string"
    );
  } catch {
    return [];
  }
}

async function hmacHex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Sign a KV attachment key for inclusion in an admin-API response. */
export async function signAttachmentKey(key: string, secret: string): Promise<string> {
  return hmacHex(secret, key);
}

/** Constant-time-ish verification of a signature produced by signAttachmentKey. */
export async function verifyAttachmentSignature(
  key: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!key || !signature || !secret) return false;
  const expected = await hmacHex(secret, key);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}
