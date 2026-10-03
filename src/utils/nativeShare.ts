import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { checkAndRecordDownload } from './freeUsageGuard';

async function getBlobSizeMB(blobUrl: string): Promise<number | undefined> {
  // blob:/data: URLs don't support HEAD (ERR_METHOD_NOT_SUPPORTED noise in
  // console) — and data: URLs embed their size. Only probe http(s).
  if (!blobUrl.startsWith('http')) return undefined;
  try {
    const res = await fetch(blobUrl, { method: 'HEAD' });
    const size = parseInt(res.headers.get('Content-Length') || '0', 10);
    return size > 0 ? size / (1024 * 1024) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Quota-gated save: returns true when the download/share was triggered,
 * false when blocked by quota or plan limits (the limit modal explains —
 * callers must not show their own success toast on false).
 */
export async function downloadOrShare(blobUrl: string, fileName: string): Promise<boolean> {
  const fileSizeMB = await getBlobSizeMB(blobUrl);
  if (!(await checkAndRecordDownload({ fileSizeMB }))) { URL.revokeObjectURL(blobUrl); return false; }

  // Track for social proof counter
  try { localStorage.setItem('toolzum:processedCount', String(Number(localStorage.getItem('toolzum:processedCount') || '0') + 1)); } catch {}

  if (Capacitor.isNativePlatform()) {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: fileName,
          url: savedFile.uri,
          dialogTitle: 'Share or Save File',
        });
        URL.revokeObjectURL(blobUrl);
      };
    } catch (e) {
      console.error('Native share failed', e);
      window.open(blobUrl, '_blank');
      URL.revokeObjectURL(blobUrl);
    }
    return true;
  } else {
    // iOS/iPadOS Safari ignores <a download> on blob URLs (it navigates
    // instead), so those need the native share sheet. Every OTHER browser
    // takes the anchor path: on desktop Chrome, navigator.share({files})
    // can RESOLVE without sharing or downloading anywhere — a "successful"
    // share that silently drops the file (e2e: export toast fires, no
    // download event ever arrives), and when it doesn't resolve it can
    // hang for seconds first.
    const isIOS =
      /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
    if (isIOS) {
      try {
        const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean; share?: (d: { files: File[]; title?: string }) => Promise<void> };
        if (nav.canShare) {
          const response = await fetch(blobUrl);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
          if (nav.canShare({ files: [file] }) && nav.share) {
            // share() can hang forever (no sheet handler, locked-down
            // headless/browser policy) — the old unconditional await left
            // "Exporting…" with no download and no error. Race it against a
            // short timeout and fall through to the anchor download.
            const shared = await Promise.race([
              nav.share({ files: [file], title: fileName }).then(() => true),
              new Promise<boolean>((r) => setTimeout(() => r(false), 3000)),
            ]);
            if (shared) {
              setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
              return true;
            }
          }
        }
      } catch {
        /* user dismissed or share failed — fall through to anchor */
      }
    }
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  }
}
