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
