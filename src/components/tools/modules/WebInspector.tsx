"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Monitor, Globe, AlertCircle, FileType, Lock, FileText, Keyboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'device' | 'ua' | 'http' | 'mime' | 'basic-auth' | 'og' | 'keycode';

const HTTP_STATUSES = [
  { code: 100, name: 'Continue', desc: 'Server has received the request headers and client should proceed.' },
  { code: 101, name: 'Switching Protocols', desc: 'Server is switching protocols as requested.' },
  { code: 200, name: 'OK', desc: 'Standard success response.' },
  { code: 201, name: 'Created', desc: 'Request fulfilled and new resource created.' },
  { code: 204, name: 'No Content', desc: 'Request succeeded but no content to return.' },
  { code: 301, name: 'Moved Permanently', desc: 'Resource permanently moved to new URL.' },
  { code: 302, name: 'Found', desc: 'Temporary redirect.' },
  { code: 304, name: 'Not Modified', desc: 'Cached version is still valid.' },
  { code: 400, name: 'Bad Request', desc: 'Server cannot process due to client error.' },
  { code: 401, name: 'Unauthorized', desc: 'Authentication is required.' },
  { code: 403, name: 'Forbidden', desc: 'Server refuses to authorize the request.' },
  { code: 404, name: 'Not Found', desc: 'Resource could not be found.' },
  { code: 405, name: 'Method Not Allowed', desc: 'HTTP method not supported for this resource.' },
  { code: 408, name: 'Request Timeout', desc: 'Server timed out waiting for request.' },
  { code: 409, name: 'Conflict', desc: 'Request conflicts with current state.' },
  { code: 410, name: 'Gone', desc: 'Resource is permanently gone (no forwarding).' },
  { code: 413, name: 'Payload Too Large', desc: 'Request entity is larger than server limits.' },
  { code: 415, name: 'Unsupported Media Type', desc: 'Media format not supported.' },
  { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded.' },
  { code: 500, name: 'Internal Server Error', desc: 'Generic server error.' },
  { code: 501, name: 'Not Implemented', desc: 'Server does not support this functionality.' },
  { code: 502, name: 'Bad Gateway', desc: 'Invalid response from upstream server.' },
  { code: 503, name: 'Service Unavailable', desc: 'Server temporarily overloaded or down.' },
  { code: 504, name: 'Gateway Timeout', desc: 'Upstream server timed out.' },
  { code: 102, name: 'Processing', desc: 'Server accepted and is processing request (WebDAV).' },
  { code: 103, name: 'Early Hints', desc: 'Server hints about resources to preload.' },
  { code: 202, name: 'Accepted', desc: 'Accepted for processing but not yet completed.' },
  { code: 203, name: 'Non-Authoritative Info', desc: 'Returned metadata from third-party copy.' },
  { code: 205, name: 'Reset Content', desc: 'Client should reset document view.' },
  { code: 206, name: 'Partial Content', desc: 'Partial GET request fulfilled.' },
  { code: 300, name: 'Multiple Choices', desc: 'Multiple representations available.' },
  { code: 303, name: 'See Other', desc: 'Redirect to another URL via GET.' },
  { code: 307, name: 'Temporary Redirect', desc: 'Temporary redirect, preserving HTTP method.' },
  { code: 308, name: 'Permanent Redirect', desc: 'Permanent redirect, preserving HTTP method.' },
  { code: 402, name: 'Payment Required', desc: 'Reserved for future use (digital payments).' },
  { code: 406, name: 'Not Acceptable', desc: 'Server cannot produce acceptable response.' },
  { code: 407, name: 'Proxy Auth Required', desc: 'Proxy authentication required.' },
  { code: 411, name: 'Length Required', desc: 'Content-Length header required.' },
  { code: 412, name: 'Precondition Failed', desc: 'Precondition in headers evaluated false.' },
  { code: 414, name: 'URI Too Long', desc: 'URI longer than server can process.' },
  { code: 416, name: 'Range Not Satisfiable', desc: 'Range header cannot be satisfied.' },
  { code: 417, name: 'Expectation Failed', desc: 'Expect header cannot be met.' },
  { code: 422, name: 'Unprocessable Entity', desc: 'Semantic errors in request (WebDAV).' },
  { code: 423, name: 'Locked', desc: 'Resource is locked (WebDAV).' },
  { code: 424, name: 'Failed Dependency', desc: 'Request failed due to previous failure (WebDAV).' },
  { code: 426, name: 'Upgrade Required', desc: 'Client should switch to a different protocol.' },
  { code: 451, name: 'Unavailable For Legal', desc: 'Resource blocked for legal reasons.' },
  { code: 505, name: 'HTTP Version Not Supported', desc: 'HTTP protocol version not supported.' },
  { code: 507, name: 'Insufficient Storage', desc: 'Server cannot store representation (WebDAV).' },
  { code: 511, name: 'Network Auth Required', desc: 'Network authentication required.' },
];

const MIME_TYPES = [
  { ext: '.html', mime: 'text/html', cat: 'Document' },
  { ext: '.css', mime: 'text/css', cat: 'Style' },
  { ext: '.js', mime: 'application/javascript', cat: 'Script' },
  { ext: '.json', mime: 'application/json', cat: 'Data' },
  { ext: '.xml', mime: 'application/xml', cat: 'Data' },
  { ext: '.txt', mime: 'text/plain', cat: 'Document' },
  { ext: '.csv', mime: 'text/csv', cat: 'Data' },
  { ext: '.pdf', mime: 'application/pdf', cat: 'Document' },
  { ext: '.png', mime: 'image/png', cat: 'Image' },
  { ext: '.jpg', mime: 'image/jpeg', cat: 'Image' },
  { ext: '.jpeg', mime: 'image/jpeg', cat: 'Image' },
  { ext: '.gif', mime: 'image/gif', cat: 'Image' },
  { ext: '.svg', mime: 'image/svg+xml', cat: 'Image' },
  { ext: '.webp', mime: 'image/webp', cat: 'Image' },
  { ext: '.ico', mime: 'image/x-icon', cat: 'Image' },
  { ext: '.avif', mime: 'image/avif', cat: 'Image' },
  { ext: '.bmp', mime: 'image/bmp', cat: 'Image' },
  { ext: '.mp3', mime: 'audio/mpeg', cat: 'Audio' },
  { ext: '.wav', mime: 'audio/wav', cat: 'Audio' },
  { ext: '.ogg', mime: 'audio/ogg', cat: 'Audio' },
  { ext: '.mp4', mime: 'video/mp4', cat: 'Video' },
  { ext: '.webm', mime: 'video/webm', cat: 'Video' },
  { ext: '.avi', mime: 'video/x-msvideo', cat: 'Video' },
  { ext: '.mov', mime: 'video/quicktime', cat: 'Video' },
  { ext: '.mkv', mime: 'video/x-matroska', cat: 'Video' },
  { ext: '.woff', mime: 'font/woff', cat: 'Font' },
  { ext: '.woff2', mime: 'font/woff2', cat: 'Font' },
  { ext: '.ttf', mime: 'font/ttf', cat: 'Font' },
  { ext: '.otf', mime: 'font/otf', cat: 'Font' },
  { ext: '.eot', mime: 'application/vnd.ms-fontobject', cat: 'Font' },
  { ext: '.zip', mime: 'application/zip', cat: 'Archive' },
  { ext: '.tar', mime: 'application/x-tar', cat: 'Archive' },
  { ext: '.gz', mime: 'application/gzip', cat: 'Archive' },
  { ext: '.rar', mime: 'application/vnd.rar', cat: 'Archive' },
  { ext: '.7z', mime: 'application/x-7z-compressed', cat: 'Archive' },
  { ext: '.wasm', mime: 'application/wasm', cat: 'Code' },
  { ext: '.mjs', mime: 'application/javascript', cat: 'Script' },
  { ext: '.ts', mime: 'application/typescript', cat: 'Script' },
  { ext: '.yaml', mime: 'application/x-yaml', cat: 'Data' },
  { ext: '.toml', mime: 'application/toml', cat: 'Data' },
  { ext: '.md', mime: 'text/markdown', cat: 'Document' },
  { ext: '.rtf', mime: 'application/rtf', cat: 'Document' },
];

function parseUA(ua: string) {
  let browser = 'Unknown'; let version = ''; let os = 'Unknown'; let device = 'Desktop';
  if (ua.includes('Chrome') && !ua.includes('Edg')) { browser = 'Chrome'; version = ua.match(/Chrome\/([\d.]+)/)?.[1] || ''; }
  else if (ua.includes('Firefox')) { browser = 'Firefox'; version = ua.match(/Firefox\/([\d.]+)/)?.[1] || ''; }
  else if (ua.includes('Safari') && !ua.includes('Chrome')) { browser = 'Safari'; version = ua.match(/Version\/([\d.]+)/)?.[1] || ''; }
  else if (ua.includes('Edg')) { browser = 'Edge'; version = ua.match(/Edg\/([\d.]+)/)?.[1] || ''; }
  else if (ua.includes('OPR') || ua.includes('Opera')) { browser = 'Opera'; version = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || ''; }
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua) && !/Android/.test(ua)) os = 'Linux';
  else if (/Android/.test(ua)) { os = 'Android'; device = 'Mobile'; }
  else if (/iPhone|iPad|iPod/.test(ua)) { os = 'iOS'; device = /iPad/.test(ua) ? 'Tablet' : 'Mobile'; }
  if (/Mobile|Android|iPhone|iPod/.test(ua) && !/iPad/.test(ua)) device = 'Mobile';
  else if (/Tablet|iPad/.test(ua)) device = 'Tablet';
  return { browser, version, os, device };
}

export default function WebInspector() {
  const [tab, setTab] = useState<Tab>('device');
  const [uaInput, setUaInput] = useState('');
  const [uaResult, setUaResult] = useState({ browser: '', version: '', os: '', device: '' });
  const [httpSearch, setHttpSearch] = useState('');
  const [mimeSearch, setMimeSearch] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');
  const [basicResult, setBasicResult] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDesc, setOgDesc] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [ogUrl, setOgUrl] = useState('');
  const [ogSite, setOgSite] = useState('');
  const [ogType, setOgType] = useState('website');
  const [ogOutput, setOgOutput] = useState('');
  const [keyInfo, setKeyInfo] = useState<Record<string, string>>({});
  const [deviceInfo, setDeviceInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    const n = navigator;
    const s = window.screen;
    setDeviceInfo({
      'User Agent': n.userAgent,
      'Platform': n.platform || 'N/A',
      'Language': n.language,
      'Languages': n.languages?.join(', ') || 'N/A',
      'Cookies Enabled': String(n.cookieEnabled),
      'Screen Size': `${s.width} × ${s.height}`,
      'Color Depth': `${s.colorDepth}-bit`,
      'Viewport': `${window.innerWidth} × ${window.innerHeight}`,
      'Device Memory': (n as any).deviceMemory ? `${(n as any).deviceMemory} GB` : 'N/A',
      'CPU Cores': String(n.hardwareConcurrency || 'N/A'),
      'Online': String(n.onLine),
      'Do Not Track': n.doNotTrack || 'N/A',
    });
    setUaInput(n.userAgent);
    setUaResult(parseUA(n.userAgent));
  }, []);

  const generateOG = useCallback(() => {
    const tags = [
      `<meta property="og:title" content="${ogTitle.replace(/"/g, '&quot;')}" />`,
      `<meta property="og:description" content="${ogDesc.replace(/"/g, '&quot;')}" />`,
      ogImage ? `<meta property="og:image" content="${ogImage}" />` : '',
      ogUrl ? `<meta property="og:url" content="${ogUrl}" />` : '',
      ogSite ? `<meta property="og:site_name" content="${ogSite.replace(/"/g, '&quot;')}" />` : '',
      `<meta property="og:type" content="${ogType}" />`,
      '',
      `<!-- Twitter Card -->`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${ogTitle.replace(/"/g, '&quot;')}" />`,
      `<meta name="twitter:description" content="${ogDesc.replace(/"/g, '&quot;')}" />`,
      ogImage ? `<meta name="twitter:image" content="${ogImage}" />` : '',
    ].filter(Boolean).join('\n');
    setOgOutput(tags);
  }, [ogTitle, ogDesc, ogImage, ogUrl, ogSite, ogType]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  const InfoRow = ({ label, val }: { label: string; val: string }) => (
    <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <span className="text-[11px] font-medium text-zinc-500">{label}</span>
      <span className="text-[11px] font-mono text-zinc-900 dark:text-white text-right max-w-[60%] break-all">{val}</span>
    </div>
  );

  const filteredHttp = HTTP_STATUSES.filter(s => {
    if (!httpSearch) return true;
    const q = httpSearch.toLowerCase();
    return String(s.code).includes(q) || s.name.toLowerCase().includes(q);
  });

  const filteredMime = MIME_TYPES.filter(m => {
    if (!mimeSearch) return true;
    const q = mimeSearch.toLowerCase();
    return m.ext.includes(q) || m.mime.includes(q) || m.cat.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
        <TabBtn v="device" label="Device" icon={Monitor} />
        <TabBtn v="ua" label="UA Parser" icon={Globe} />
        <TabBtn v="http" label="HTTP Codes" icon={AlertCircle} />
        <TabBtn v="mime" label="MIME Types" icon={FileType} />
        <TabBtn v="basic-auth" label="Basic Auth" icon={Lock} />
        <TabBtn v="og" label="OG Meta" icon={FileText} />
        <TabBtn v="keycode" label="Keycode" icon={Keyboard} />
      </div>

      {tab === 'device' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
          <div className="space-y-0">
            {Object.entries(deviceInfo).map(([k, v]) => <InfoRow key={k} label={k} val={v} />)}
          </div>
        </div>
      )}

      {tab === 'ua' && (
        <div className="space-y-4">
          <input value={uaInput} onChange={e => { setUaInput(e.target.value); setUaResult(parseUA(e.target.value)); }} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          {uaResult.browser && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
              <div className="space-y-0">
                <InfoRow label="Browser" val={uaResult.browser} />
                <InfoRow label="Version" val={uaResult.version || 'Unknown'} />
                <InfoRow label="Operating System" val={uaResult.os} />
                <InfoRow label="Device Type" val={uaResult.device} />
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'http' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
          <input value={httpSearch} onChange={e => setHttpSearch(e.target.value)} placeholder="Search by code or name..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
          <div className="max-h-[400px] overflow-y-auto space-y-0.5">
            {filteredHttp.map(s => (
              <div key={s.code} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <span className={`text-xs font-bold w-12 px-1.5 py-0.5 rounded ${s.code < 200 ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : s.code < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : s.code < 400 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : s.code < 500 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                  {s.code}
                </span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-white w-40">{s.name}</span>
                <span className="text-[11px] text-zinc-500 flex-1">{s.desc}</span>
              </div>
            ))}
            {filteredHttp.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">No matching status codes.</p>}
          </div>
        </div>
      )}

      {tab === 'mime' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
          <input value={mimeSearch} onChange={e => setMimeSearch(e.target.value)} placeholder="Search by extension, MIME type, or category..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead><tr className="text-zinc-400 font-bold uppercase text-[10px] border-b border-zinc-200 dark:border-zinc-800"><th className="text-left py-2 px-2">Extension</th><th className="text-left py-2 px-2">MIME Type</th><th className="text-left py-2 px-2">Category</th></tr></thead>
              <tbody>
                {filteredMime.map(m => (
                  <tr key={m.ext} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-1.5 px-2 font-mono text-zinc-900 dark:text-white">{m.ext}</td>
                    <td className="py-1.5 px-2 font-mono text-zinc-600 dark:text-zinc-400">{m.mime}</td>
                    <td className="py-1.5 px-2 text-zinc-500">{m.cat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredMime.length === 0 && <p className="text-xs text-zinc-400 text-center py-4">No matching MIME types.</p>}
          </div>
        </div>
      )}

      {tab === 'basic-auth' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input value={basicUser} onChange={e => { setBasicUser(e.target.value); setBasicResult(btoa(e.target.value + ':' + basicPass)); }} placeholder="Username..." className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
            <input value={basicPass} onChange={e => { setBasicPass(e.target.value); setBasicResult(btoa(basicUser + ':' + e.target.value)); }} type="password" placeholder="Password..." className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          </div>
          {basicUser && basicPass && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
              <div className="relative">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Authorization Header</label>
                <input type="text" readOnly value={`Basic ${basicResult}`} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 font-mono outline-none" />
                <button onClick={() => copy(`Basic ${basicResult}`, 'Header')} className="absolute top-7 right-2 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-0.5 rounded">Copy</button>
              </div>
              <InfoRow label="Raw Base64" val={basicResult} />
            </div>
          )}
        </div>
      )}

      {tab === 'og' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
            <input value={ogTitle} onChange={e => { setOgTitle(e.target.value); setTimeout(generateOG, 0); }} placeholder="Title..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
            <textarea value={ogDesc} onChange={e => { setOgDesc(e.target.value); setTimeout(generateOG, 0); }} placeholder="Description..." rows={3} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none resize-none" />
            <input value={ogImage} onChange={e => { setOgImage(e.target.value); setTimeout(generateOG, 0); }} placeholder="Image URL..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
            <input value={ogUrl} onChange={e => { setOgUrl(e.target.value); setTimeout(generateOG, 0); }} placeholder="Page URL..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
            <input value={ogSite} onChange={e => { setOgSite(e.target.value); setTimeout(generateOG, 0); }} placeholder="Site Name..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none" />
            <select value={ogType} onChange={e => { setOgType(e.target.value); setTimeout(generateOG, 0); }} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none">
              {['website', 'article', 'product', 'video.movie', 'video.episode', 'music.song', 'profile'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Generated Meta Tags</label>
            <textarea value={ogOutput} readOnly placeholder="Fill in fields to generate..." className="w-full h-[280px] bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs text-zinc-900 dark:text-emerald-400 placeholder:text-zinc-400 outline-none resize-none font-mono" />
            {ogOutput && <button onClick={() => copy(ogOutput, 'Meta tags')} className="absolute top-7 right-3 text-[10px] text-indigo-400 hover:underline bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700">Copy</button>}
          </div>
        </div>
      )}

      {tab === 'keycode' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <input placeholder="Press any key here..." onKeyDown={e => {
            setKeyInfo({
              'key': e.key,
              'code': e.code,
              'keyCode': String(e.keyCode),
              'which': String(e.which),
              'charCode': String(e.charCode),
              'altKey': String(e.altKey),
              'ctrlKey': String(e.ctrlKey),
              'shiftKey': String(e.shiftKey),
              'metaKey': String(e.metaKey),
              'location': String(e.location),
              'repeat': String(e.repeat),
            });
          }} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 text-sm text-zinc-900 dark:text-white outline-none font-mono text-center" />
          {Object.keys(keyInfo).length > 0 && (
            <div className="space-y-0">
              {Object.entries(keyInfo).map(([k, v]) => <InfoRow key={k} label={k} val={v} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
