"use client";

import React, { useState } from 'react';
import { useRovingTabs } from "@/components/useRovingTabs";
import { Eye, Download, Video, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { downloadOrShare } from '@/utils/nativeShare';

export default function ScreenRecorderExtension() {
  const [activeTab, setActiveTab] = useState<'manifest' | 'popupHtml' | 'popupJs'>('manifest');
  const extTabs = useRovingTabs(
    ['manifest', 'popupHtml', 'popupJs'] as const,
    activeTab,
    setActiveTab,
    "data-ext-tab",
  );
  const [extName, setExtName] = useState('Tab Recorder Pro');

  const manifest = `{
  "manifest_version": 3,
  "name": "${extName}",
  "version": "1.0",
  "description": "Quick screen and tab video recorder extension utility.",
  "permissions": [
    "tabCapture"
  ],
  "action": {
    "default_popup": "popup.html"
  }
}`;

  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 220px; padding: 10px; font-family: sans-serif; background: #09090b; color: white; }
    .header { font-size: 13px; font-weight: bold; color: #ec4899; text-align: center; margin-bottom: 10px; }
    button { width: 100%; padding: 8px; border-radius: 6px; cursor: pointer; border: none; font-weight: bold; }
    .start-btn { background: #ec4899; color: white; }
    .stop-btn { background: #52525b; color: white; margin-top: 5px; }
  </style>
</head>
<body>
  <div className="header">Screen Recorder</div>
  <button id="startBtn" className="start-btn">Start Recording</button>
  <button id="stopBtn" className="stop-btn">Stop & Save</button>
  <script src="popup.js"></script>
</body>
</html>`;

  const popupJs = `let mediaRecorder;
let recordedChunks = [];

document.getElementById('startBtn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.webm';
      a.click();
      recordedChunks = [];
    };

    mediaRecorder.start();
  } catch (e) {
    console.error('Failed to capture stream: ', e);
  }
});

document.getElementById('stopBtn').addEventListener('click', () => {
  if (mediaRecorder) mediaRecorder.stop();
});`;

  const handleDownload = async () => {
    try {
      const zip = new JSZip();
      zip.file("manifest.json", manifest);
      zip.file("popup.html", popupHtml);
      zip.file("popup.js", popupJs);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      downloadOrShare(url, `screen_recorder_extension.zip`);
      toast.success('Screen recorder extension ZIP downloaded!');
    } catch (err) {
      toast.error('Failed to create package');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-[var(--accent)]" />
          Tab Screen Recorder Extension Builder
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Build and download a custom Chrome extension package allowing users to capture active tab video streams directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block border-b border-[var(--border-subtle)] pb-2">Settings</span>
          
          <div className="space-y-2">
            <label htmlFor="lbl-screenrecorderextension-extension-name" className="text-xs text-[var(--text-muted)] font-bold">Extension Name</label>
            <input id="lbl-screenrecorderextension-extension-name" aria-label="Extension Name" 
              type="text" 
              value={extName} 
              onChange={e => setExtName(e.target.value)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            />
          </div>

          <button onClick={handleDownload} className="w-full mt-4 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" /> Download Extension ZIP
          </button>
        </div>

        <div className="lg:col-span-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between min-h-[450px]">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex bg-[var(--bg-overlay)]/45 p-1 rounded-xl gap-1" role="tablist" aria-label="Extension files" onKeyDown={extTabs.onKeyDown}>
              <button role="tab" {...extTabs.tabProps('manifest')} aria-selected={activeTab === 'manifest'} onClick={() => setActiveTab('manifest')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'manifest' ? 'bg-white dark:bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                manifest.json
              </button>
              <button role="tab" {...extTabs.tabProps('popupHtml')} aria-selected={activeTab === 'popupHtml'} onClick={() => setActiveTab('popupHtml')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'popupHtml' ? 'bg-white dark:bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                popup.html
              </button>
              <button role="tab" {...extTabs.tabProps('popupJs')} aria-selected={activeTab === 'popupJs'} onClick={() => setActiveTab('popupJs')} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${activeTab === 'popupJs' ? 'bg-white dark:bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                popup.js
              </button>
            </div>

            <textarea aria-label={activeTab === 'manifest' ? 'manifest.json' : activeTab === 'popupHtml' ? 'popup.html' : 'popup.js'}
              value={activeTab === 'manifest' ? manifest : activeTab === 'popupHtml' ? popupHtml : popupJs}
              readOnly
              className="w-full flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-emerald-700 dark:text-emerald-400 font-mono h-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}