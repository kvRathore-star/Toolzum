import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { checkAndRecordDownload } from './freeUsageGuard';

export async function downloadOrShare(blobUrl: string, fileName: string) {
  if (!(await checkAndRecordDownload())) return;

  if (Capacitor.isNativePlatform()) {
    try {
      // Fetch blob from blob url
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        
        // Write to Cache
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64data,
          directory: Directory.Cache
        });
        
        // Trigger native share bottom sheet
        await Share.share({
          title: fileName,
          url: savedFile.uri,
          dialogTitle: 'Share or Save File'
        });
      };
    } catch (e) {
      console.error('Native share failed', e);
      window.open(blobUrl, '_blank');
    }
  } else {
    // Standard web browser download fallback
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
