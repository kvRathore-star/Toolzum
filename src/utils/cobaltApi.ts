// Utility wrapper for the Cobalt API (Open Source Media Downloader)
// Supports: YouTube, TikTok, Instagram, Twitter, Facebook, Reddit, and more.

const COBALT_ENDPOINTS = [
  'https://api.cobalt.tools/api/json',
  'https://co.wuk.sh/api/json',
  'https://cobalt.kwiatekm.cloud/api/json'
];

export interface CobaltResponse {
  status: 'error' | 'redirect' | 'stream' | 'success' | 'rate-limit' | 'picker';
  text?: string;
  url?: string;
  pickerType?: string;
  picker?: { url: string; type: string }[];
  audio?: string;
}

export interface CobaltOptions {
  url: string;
  vQuality?: '360' | '480' | '720' | '1080' | '1440' | '2160' | 'max';
  vCodec?: 'h264' | 'av1' | 'vp9';
  aFormat?: 'best' | 'mp3' | 'ogg' | 'wav' | 'opus';
  isAudioOnly?: boolean;
  isNoTTWatermark?: boolean;
}

export async function fetchCobaltDownload(options: CobaltOptions): Promise<CobaltResponse> {
  const fetchWithTimeout = async (url: string, body: unknown, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  };

  const body = {
    url: options.url,
    vQuality: options.vQuality || '1080',
    vCodec: options.vCodec || 'h264',
    aFormat: options.aFormat || 'mp3',
    isAudioOnly: options.isAudioOnly || false,
    isNoTTWatermark: options.isNoTTWatermark !== false,
  };

  let lastError = null;

  for (const endpoint of COBALT_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(endpoint, body, 15000);

      if (!response.ok) {
        if (response.status === 429) {
           console.warn(`Rate limited on endpoint: ${endpoint}`);
           continue; // Try next fallback
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data: CobaltResponse = await response.json();
      return data;
    } catch (error: unknown) {
      console.warn(`Failed on endpoint ${endpoint}:`, error);
      lastError = error;
      continue; // Try next fallback
    }
  }

  return { status: 'error', text: 'All download servers are currently busy or rate-limited. Please try again in a few minutes.' };
}
