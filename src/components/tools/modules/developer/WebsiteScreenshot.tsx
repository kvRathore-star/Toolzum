"use client";

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { getErrorMessage } from '@/utils/error';

export default function WebsiteScreenshot() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<'png'|'jpg'|'webp'|'tiff'>('png');
  const [quality, setQuality] = useState(0.92);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [customWidth, setCustomWidth] = useState('');
  const [fullPage, setFullPage] = useState(false);
  const [captureDelay, setCaptureDelay] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string|null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (screenshotUrl?.startsWith('blob:')) URL.revokeObjectURL(screenshotUrl);
    };
  }, [screenshotUrl]);

  const normalizeUrl = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) throw new Error('Please enter a valid URL');
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  };

  const getFormatExtension = (): string => {
    switch (format) {
      case 'jpg': return 'jpg';
      case 'png': return 'png';
      case 'webp': return 'webp';
      case 'tiff': return 'tiff';
    }
  };

  const getFormatMime = (): string => {
    switch (format) {
      case 'jpg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      case 'tiff': return 'image/tiff';
    }
  };

  const writeTiff = (imageData: ImageData): Blob => {
    const w = imageData.width;
    const h = imageData.height;
    const d = imageData.data;
    const spp = 3;
    const rowLen = w * spp;
    const pixelBytes = rowLen * h;
    const numTags = 10;
    const ifdBytes = 2 + numTags * 12 + 4;
    const bpsOffset = 8 + ifdBytes;
    const dataOffset = bpsOffset + spp * 2;
    const totalBytes = dataOffset + pixelBytes;
    const buf = new ArrayBuffer(totalBytes);
    const v = new DataView(buf);
    let o = 0;

    v.setUint16(o, 0x4949, true); o += 2;
    v.setUint16(o, 42, true); o += 2;
    v.setUint32(o, 8, true); o += 4;

    v.setUint16(o, numTags, true); o += 2;

    const tag = (t: number, ty: number, cnt: number, val: number) => {
      v.setUint16(o, t, true); o += 2;
      v.setUint16(o, ty, true); o += 2;
      v.setUint32(o, cnt, true); o += 4;
      v.setUint32(o, val, true); o += 4;
    };

    tag(256, 4, 1, w);
    tag(257, 4, 1, h);

    v.setUint16(o, 258, true); o += 2;
    v.setUint16(o, 3, true); o += 2;
    v.setUint32(o, spp, true); o += 4;
    v.setUint32(o, bpsOffset, true); o += 4;

    tag(259, 3, 1, 1);
    tag(262, 3, 1, 2);
    tag(273, 4, 1, dataOffset);
    tag(277, 3, 1, spp);
    tag(278, 4, 1, h);
    tag(279, 4, 1, pixelBytes);
    tag(296, 3, 1, 2);

    v.setUint32(o, 0, true); o += 4;

    v.setUint16(o, 8, true); o += 2;
    v.setUint16(o, 8, true); o += 2;
    v.setUint16(o, 8, true); o += 2;

    const pixels = new Uint8Array(buf, dataOffset, pixelBytes);
    for (let i = 0; i < w * h; i++) {
      const si = i * 4;
      const di = i * 3;
      pixels[di] = d[si] ?? 0;
      pixels[di + 1] = d[si + 1] ?? 0;
      pixels[di + 2] = d[si + 2] ?? 0;
    }

    return new Blob([buf], { type: 'image/tiff' });
  };

  const getEffectiveWidth = (): number => {
    if (viewportWidth === -1) {
      const parsed = parseInt(customWidth, 10);
      if (isNaN(parsed) || parsed < 320 || parsed > 3840) {
        throw new Error('Custom width must be between 320 and 3840');
      }
      return parsed;
    }
    return viewportWidth;
  };

  const handleCapture = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const targetUrl = normalizeUrl(url);
      setUrl(targetUrl);
      const effectiveWidth = getEffectiveWidth();

      // Same-origin first: our own /api/fetch-page has no CORS problem,
      // no third-party rate limits, and no Shields-flagged proxy domain.
      // The public proxies below are fallback only, not primary.
      let html: string | null = null;
      let lastStatus = '';
      try {
        const res = await fetch('/api/fetch-page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
          signal: AbortSignal.timeout(25000),
        });
        if (res.ok) {
          const data = (await res.json()) as { html?: string };
          if (data.html) html = data.html;
          else lastStatus = 'empty response';
        } else if (res.status === 429) {
          throw new Error('Screenshot rate limit hit — wait a minute and retry.');
        } else {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          lastStatus = data.error || `HTTP ${res.status}`;
        }
      } catch (e) {
        if (e instanceof Error && /rate limit/i.test(e.message)) throw e;
        lastStatus = e instanceof Error && e.name === 'TimeoutError' ? 'timed out' : 'unreachable';
      }
      // Fetch proxies are individually flaky (rate limits, downtime, Brave
      // Shields flagging proxy domains). Chain three with short timeouts;
      // the final error names what to check instead of "Failed to fetch".
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
      ];
      if (html === null) {
        for (const proxyUrl of proxies) {
          try {
            const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(20000) });
            if (!res.ok) {
              lastStatus = `HTTP ${res.status}`;
              continue;
            }
            html = await res.text();
            break;
          } catch (e) {
            lastStatus = e instanceof Error && e.name === 'TimeoutError' ? 'timed out' : 'unreachable';
          }
        }
      }
      if (html === null) {
        if (lastStatus.startsWith('upstream_')) {
          throw new Error(
            `That site refused the fetch (${lastStatus.replace('upstream_', 'HTTP ')}). Some sites block all bots and proxies — nothing to retry here; try a different URL.`,
          );
        }
        if (lastStatus === 'not_html') {
          throw new Error('That URL is not a web page (PDF, image, or download). Screenshots need an HTML page.');
        }
        if (lastStatus === 'too_large') {
          throw new Error('That page is too large to screenshot (over ~1.5 MB of HTML). Try a lighter page.');
        }
        throw new Error(
          `Page fetch failed (${lastStatus || 'blocked'}) — our server and all fallback proxies failed. Brave Shields may block the proxy domains (try shields-down once), or the target blocks bots; retry in a minute.`,
        );
      }
      html = html.replace('<head>', `<head><base href="${targetUrl}">`);

      const el = contentRef.current;
      if (!el) throw new Error('Content container not found');
      el.style.width = `${effectiveWidth}px`;
      el.innerHTML = DOMPurify.sanitize(html);

      await new Promise(r => setTimeout(r, 2000 + captureDelay * 1000));

      const canvas = await html2canvas(el, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        logging: false,
        width: effectiveWidth,
        ...(fullPage ? {} : { height: Math.min(el.scrollHeight || 1080, 1080) }),
      });

      let blob: Blob | null;

      if (format === 'tiff') {
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        blob = writeTiff(imageData);
      } else {
        blob = await new Promise<Blob|null>(r => canvas.toBlob(b => r(b), getFormatMime(), quality));
      }

      if (!blob) throw new Error('Failed to generate image');

      if (screenshotUrl?.startsWith('blob:')) URL.revokeObjectURL(screenshotUrl);
      setScreenshotUrl(URL.createObjectURL(blob));
      toast.success('Screenshot captured!');
    } catch (e: unknown) {
      const msg = (e instanceof Error && e.name === 'TimeoutError')
        ? 'Request timed out. The site may be slow or blocked.'
        : getErrorMessage(e, 'Failed to capture screenshot');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!screenshotUrl) return;
    try {
      await downloadOrShare(screenshotUrl, `screenshot-${Date.now()}.${getFormatExtension()}`);
    } catch {
      toast.error('Download failed');
    }
  };

  const reset = () => {
    if (screenshotUrl?.startsWith('blob:')) URL.revokeObjectURL(screenshotUrl);
    setScreenshotUrl(null);
    setUrl('');
    setError(null);
    if (contentRef.current) contentRef.current.innerHTML = '';
  };

  const handleViewportPreset = (value: number) => {
    setViewportWidth(value);
    setCustomWidth('');
  };

  const viewportPresets = [
    { label: 'Mobile', value: 375 },
    { label: 'Tablet', value: 768 },
    { label: 'Desktop', value: 1280 },
    { label: 'Wide', value: 1920 },
  ];

  if (!screenshotUrl) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Website Screenshot:</strong> Capture screenshots of websites in your browser.
          The page HTML is fetched via a proxy and rendered locally. External CSS and images
          may not load — results work best on simple or text-based pages.
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <input aria-label="Website URL"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !isProcessing && handleCapture()}
              placeholder="https://example.com"
              className="flex-1 px-4 py-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button
              onClick={handleCapture}
              disabled={isProcessing || !url.trim()}
              className="px-6 py-3 bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-lg flex items-center gap-2"
            >
              {isProcessing ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              )}
              {isProcessing ? 'Capturing...' : 'Capture'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">Format</label>
              <div className="flex flex-wrap gap-2">
                {(['png', 'jpg', 'webp', 'tiff'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                      format === f
                        ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]'
                        : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent)]'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {format === 'jpg' && (
              <div className="space-y-2">
                <label htmlFor="lbl-websitescreenshot-quality-math-round-quality-100" className="text-sm font-medium text-[var(--text-primary)]">
                  Quality: {Math.round(quality * 100)}%
                </label>
                <input id="lbl-websitescreenshot-quality-math-round-quality-100"
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round(quality * 100)} aria-label="Quality"
                  onChange={e => setQuality(parseInt(e.target.value) / 100)}
                  className="w-full accent-blue-600"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="lbl-websitescreenshot-viewport-width" className="text-sm font-medium text-[var(--text-primary)]">Viewport Width</label>
            <div className="flex flex-wrap gap-2">
              {viewportPresets.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleViewportPreset(p.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                    viewportWidth === p.value
                      ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]'
                      : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => { setViewportWidth(-1); setCustomWidth(''); }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                  viewportWidth === -1
                    ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)]'
                    : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent)]'
                }`}
              >
                Custom
              </button>
            </div>
            {viewportWidth === -1 && (
              <input id="lbl-websitescreenshot-viewport-width" aria-label="Viewport Width"
                type="number"
                value={customWidth}
                onChange={e => setCustomWidth(e.target.value)}
                placeholder="Enter width (320-3840)"
                min={320}
                max={3840}
                className="mt-2 w-full px-3 py-2 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]"
              />
            )}
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={fullPage}
                onChange={e => setFullPage(e.target.checked)}
                className="rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              Full page
            </label>

            <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <span>Delay:</span>
              <input aria-label="Delay:"
                type="range"
                min={0}
                max={10}
                value={captureDelay}
                onChange={e => setCaptureDelay(parseInt(e.target.value))}
                className="w-24 accent-blue-600"
              />
              <span className="text-[var(--text-secondary)] w-6">{captureDelay}s</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              {error}
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] p-4 rounded-xl text-xs text-[var(--text-secondary)] space-y-1">
          <p>⚠️ <strong>Limitations:</strong> Pages are fetched server-side and rendered locally in your browser, so external CSS, images, and JavaScript may not load — results work best on simple or text-based pages. Sites that block all bots may refuse the fetch entirely. For full-featured screenshots, consider a browser extension or a server-side tool like Puppeteer.</p>
          <p className="pt-1">💡 <strong>Tip:</strong> The delay only settles the local static render — page JavaScript never runs, so longer waits cannot load JS-driven content.</p>
        </div>

        <div ref={contentRef} className="fixed left-[-9999px] top-0" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          <svg className="w-5 h-5 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m0 0a9 9 0 019 9"/></svg>
          <span className="font-bold text-[var(--text-primary)] text-sm truncate">{url}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-ink)] hover:opacity-90 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Download {format.toUpperCase()}
          </button>
          <button
            onClick={reset}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-2 bg-[var(--bg-surface)] rounded-xl"
          >
            Capture Another
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h4 className="text-[var(--text-primary)] font-medium">Preview</h4>
          <span className="text-xs text-[var(--text-secondary)]">{format.toUpperCase()} · {viewportWidth}px</span>
        </div>
        <div className="relative w-full bg-[var(--bg-surface)] flex items-start justify-center p-4" style={{ minHeight: '50vh', maxHeight: '80vh', overflow: 'auto' }}>
          <img
            src={screenshotUrl!}
            alt={`Screenshot of ${url}`}
            className="shadow-2xl rounded-lg max-w-full"
            style={{ width: Math.min(viewportWidth, 1200) + 'px' }}
          />
        </div>
      </div>

      <div className="text-xs text-[var(--text-secondary)] text-center px-4">
        Right-click the image to save, or use the Download button above.
      </div>
    </div>
  );
}
