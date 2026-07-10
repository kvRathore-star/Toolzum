"use client";

import React, { useState } from "react";
import { 
  Globe, 
  ArrowRight, 
  Download, 
  Settings, 
  Grid, 
  Pipette, 
  Camera, 
  Copy, 
  Check, 
  QrCode, 
  Info,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function ChromeExtensionPage() {
  const [activeTab, setActiveTab] = useState<"picker" | "tools" | "qr">("picker");
  const [selectedColor, setSelectedColor] = useState("#a855f7");
  const [copied, setCopied] = useState(false);
  const [qrText, setQrText] = useState("https://toolzum.com");
  const [copiedZip, setCopiedZip] = useState(false);

  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6", "#f43f5e"];

  const handleCopyColor = (color: string) => {
    setSelectedColor(color);
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = () => {
    toast.success("Coming soon — join the waitlist for early access.");
    
    setCopiedZip(true);
    setTimeout(() => setCopiedZip(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Abstract background grid */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Globe className="w-3.5 h-3.5" /> Direct Browser Integration
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Toolzum at your fingertips.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Access your favorite utility tools without switching tabs. Take full-page screenshots, pick colors from elements, and encode text instantly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="gap-2 opacity-60 cursor-not-allowed" disabled>
              <Download className="w-4.5 h-4.5" /> Download Extension ZIP
            </Button>
            <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="gap-2">
                Chrome Web Store <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {/* Dynamic extension preview & browser mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Features Column */}
          <div className="lg:col-span-6 space-y-8">
            <div>
              <h2 className="text-3xl font-semibold mb-4">Interactive Demo Sandbox</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Interact with the browser popup mock on the right to preview how the extension brings key Toolzum features straight into your browsing workflow.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 mt-1">
                  <Pipette className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Active Screen Color Picker</h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Pick colors from absolute screen pixels and copy them directly in Hex, RGB, or HSL layouts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-1">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Full-Page & Viewport Capture</h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Take high-resolution screenshots of elements, selections, or full-length scrollable web pages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-1">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Quick QR & Utility Center</h4>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Instantly encode URLs as QR codes, min/max base64 values, and format web formats with one keystroke.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Browser & Extension Popup Mock */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[380px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] overflow-hidden shadow-2xl relative">
              
              {/* Mock Browser Header */}
              <div className="bg-[var(--bg-overlay)] px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <div className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-4 py-0.5 rounded border border-[var(--border-subtle)]">
                  toolzum-extension
                </div>
                <Settings className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              </div>

              {/* Extension Body */}
              <div className="p-5 min-h-[360px] flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded bg-[var(--accent)] text-white flex items-center justify-center font-bold text-xs">T</div>
                    <span className="font-semibold text-sm text-[var(--text-primary)]">Toolzum Quick</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setActiveTab("picker")} className={`p-1.5 rounded transition-colors ${activeTab === "picker" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-white"}`}><Pipette className="w-4 h-4" /></button>
                    <button onClick={() => setActiveTab("tools")} className={`p-1.5 rounded transition-colors ${activeTab === "tools" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-white"}`}><Grid className="w-4 h-4" /></button>
                    <button onClick={() => setActiveTab("qr")} className={`p-1.5 rounded transition-colors ${activeTab === "qr" ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-white"}`}><QrCode className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Tab content: Color Picker */}
                {activeTab === "picker" && (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-[var(--text-muted)] tracking-wider mb-3">Color Dropper</h4>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded border border-[var(--border-subtle)] shadow-inner transition-colors duration-200" style={{ backgroundColor: selectedColor }} />
                        <div className="flex-1">
                          <div className="text-xs font-mono text-[var(--text-secondary)]">HEX value</div>
                          <div className="text-sm font-semibold font-mono flex items-center gap-1.5 mt-0.5">
                            {selectedColor}
                            <button onClick={() => handleCopyColor(selectedColor)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                              {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {colors.map(color => (
                          <button
                            key={color}
                            onClick={() => handleCopyColor(color)}
                            className="h-7 rounded border border-black/20 relative group overflow-hidden transition-transform hover:scale-105"
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button className="w-full text-xs py-2 h-auto" onClick={() => toast("Select a color anywhere on your screen.", { icon: "🎨" })}>
                      <Pipette className="w-3.5 h-3.5 mr-2" /> Launch Pipette Eyedropper
                    </Button>
                  </div>
                )}

                {/* Tab content: Quick Tools */}
                {activeTab === "tools" && (
                  <div className="flex-1 space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-[var(--text-muted)] tracking-wider mb-2">Instant Operations</h4>
                    
                    <button onClick={() => toast("Page snapshot capturing queued.", { icon: "📸" })} className="w-full flex items-center justify-between p-2.5 rounded bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)]/80 border border-[var(--border-subtle)] text-xs text-left group">
                      <span className="flex items-center gap-2"><Camera className="w-3.5 h-3.5 text-[var(--accent)]" /> Capture Full Page</span>
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button onClick={() => toast("Opening Base64 Encoder...", { icon: "🔗" })} className="w-full flex items-center justify-between p-2.5 rounded bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)]/80 border border-[var(--border-subtle)] text-xs text-left group">
                      <span className="flex items-center gap-2"><Copy className="w-3.5 h-3.5 text-blue-400" /> Base64 Encoder</span>
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button onClick={() => toast("Opening Password Generator...", { icon: "🔑" })} className="w-full flex items-center justify-between p-2.5 rounded bg-[var(--bg-overlay)] hover:bg-[var(--bg-overlay)]/80 border border-[var(--border-subtle)] text-xs text-left group">
                      <span className="flex items-center gap-2"><Settings className="w-3.5 h-3.5 text-emerald-400" /> Password Generator</span>
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Tab content: QR Code */}
                {activeTab === "qr" && (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-[var(--text-muted)] tracking-wider mb-2">QR Code generator</h4>
                      <input
                        type="text"
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                        placeholder="Type text or url..."
                        className="w-full bg-[var(--bg-base)] text-xs border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] mb-3"
                      />

                      <div className="flex justify-center bg-white p-3 rounded-[var(--radius-lg)] w-32 h-32 mx-auto border border-zinc-200 shadow-inner">
                        {/* Simulated QR Code Canvas */}
                        <div className="grid grid-cols-8 gap-0.5 w-full h-full bg-white opacity-85">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div key={i} className={`w-full h-full ${((i + qrText.length) % 3 === 0 || i % 7 === 0 || i < 8 || i % 8 === 0) ? "bg-black" : "bg-white"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="secondary" className="w-full text-xs py-2 h-auto mt-2" onClick={() => toast("Copied simulated QR code to clipboard", { icon: "✅" })}>
                      Copy Image
                    </Button>
                  </div>
                )}

                {/* Footer status link */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span>Version 1.2.0</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" /> Sandbox active</span>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Installation Instructions */}
        <div className="max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-[var(--accent)]" /> How to Install in Developer Mode
          </h2>
          
          <div className="space-y-6 text-sm">
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">1</span>
              <div>
                <h4 className="font-semibold">Download and Extract ZIP</h4>
                <p className="text-[var(--text-secondary)] mt-1">
                  Click the "Download Extension ZIP" button at the top to download the extension bundle, then extract it to a folder on your computer.
                </p>
                {copiedZip && (
                  <div className="mt-2 text-xs text-emerald-400 font-medium">
                    ✓ Extension ZIP generated and downloaded successfully!
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">2</span>
              <div>
                <h4 className="font-semibold">Open Chrome Extensions Settings</h4>
                <p className="text-[var(--text-secondary)] mt-1">
                  Open a new tab in Google Chrome and navigate to <code className="bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-xs font-mono">chrome://extensions</code>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">3</span>
              <div>
                <h4 className="font-semibold">Enable Developer Mode</h4>
                <p className="text-[var(--text-secondary)] mt-1">
                  Turn on the toggle switch labeled <strong>Developer mode</strong> in the top-right corner of the Extensions dashboard.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">4</span>
              <div>
                <h4 className="font-semibold">Load Unpacked Extension</h4>
                <p className="text-[var(--text-secondary)] mt-1">
                  Click the <strong>Load unpacked</strong> button in the top-left and select the extracted extension folder. The Toolzum extension icon will now appear in your browser bar!
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
