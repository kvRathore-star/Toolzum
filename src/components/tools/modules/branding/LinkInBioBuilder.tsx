"use client";

import React, { useState, useMemo } from 'react';
import { Copy, Check, Download, Plus, Trash2, GripVertical, Image as ImageIcon, Link, Palette, Eye, Code, Smartphone, MoveUp, MoveDown, Globe, Camera, Video, Music, ShoppingBag, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
}

const ICON_OPTIONS = [
  { value: 'globe', label: 'Website', icon: <Globe className="w-3.5 h-3.5" /> },
  { value: 'instagram', label: 'Instagram', icon: <Camera className="w-3.5 h-3.5" /> },
  { value: 'twitter', label: 'Twitter / X', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { value: 'youtube', label: 'YouTube', icon: <Video className="w-3.5 h-3.5" /> },
  { value: 'music', label: 'Spotify / Music', icon: <Music className="w-3.5 h-3.5" /> },
  { value: 'shopping', label: 'Shop / Store', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  { value: 'link', label: 'Other Link', icon: <Link className="w-3.5 h-3.5" /> },
];

export default function LinkInBioBuilder() {
  const [links, setLinks] = useState<LinkItem[]>([
    { id: '1', title: 'My Website', url: 'https://example.com', icon: 'globe' },
  ]);
  const [profileName, setProfileName] = useState('Your Name');
  const [profileBio, setProfileBio] = useState('Creator | Builder | India');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#0f172a');
  const [cardColor, setCardColor] = useState('#1e293b');
  const [textColor, setTextColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#10b981');
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('globe');

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return toast.error('Fill in title and URL');
    const id = Date.now().toString();
    setLinks(prev => [...prev, { id, title: newTitle.trim(), url: newUrl.trim(), icon: newIcon }]);
    setNewTitle('');
    setNewUrl('');
    toast.success('Link added!');
  };

  const removeLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const moveLink = (id: string, direction: 'up' | 'down') => {
    const idx = links.findIndex(l => l.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === links.length - 1) return;
    const newLinks = [...links];
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    [newLinks[idx], newLinks[swap]] = [newLinks[swap], newLinks[idx]];
    setLinks(newLinks);
  };

  const handleProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (profileImage) URL.revokeObjectURL(profileImage);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const generateHtml = useMemo(() => {
    const linkCards = links.map(l => {
      const iconSvg = l.icon === 'globe' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
        : l.icon === 'instagram' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>'
        : l.icon === 'twitter' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.5-3 1.2-6 4-7 1 1.2 2 2 3 2z"/></svg>'
        : l.icon === 'youtube' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>'
        : l.icon === 'music' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>'
        : l.icon === 'shopping' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>'
        : l.icon === 'whatsapp' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';

      return `    <a href="${l.url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:12px;padding:14px 20px;background:${cardColor};border-radius:14px;text-decoration:none;color:${textColor};font-size:14px;font-weight:500;transition:transform 0.15s;border:1px solid rgba(255,255,255,0.06)">
      ${iconSvg}
      <span style="flex:1">${l.title}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="opacity:0.4"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
    </a>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profileName} | Link in Bio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: ${bgColor}; color: ${textColor}; min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 48px 16px; }
    .container { width: 100%; max-width: 480px; }
    .profile { text-align: center; margin-bottom: 32px; }
    .avatar { width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 3px solid ${accentColor}; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    p.bio { font-size: 14px; opacity: 0.7; line-height: 1.5; }
    .links { display: flex; flex-direction: column; gap: 10px; }
    .links a:hover { transform: scale(1.02); }
    .footer { margin-top: 32px; text-align: center; font-size: 12px; opacity: 0.4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile">
      <img src="${profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profileName) + '&background=' + accentColor.replace('#', '') + '&color=fff&size=96'}" alt="${profileName}" class="avatar">
      <h1>${profileName}</h1>
      <p class="bio">${profileBio}</p>
    </div>
    <div class="links">
${linkCards}
    </div>
    <div class="footer">Made with Toolzum</div>
  </div>
</body>
</html>`;
  }, [links, profileName, profileBio, profileImage, bgColor, cardColor, textColor, accentColor]);

  const handleCopyHtml = () => {
    clipboardWrite(generateHtml);
    setCopied(true);
    toast.success('HTML copied! Deploy on GitHub Pages, Vercel, or Netlify.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generateHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('HTML downloaded!');
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Link className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Link-in-Bio Builder</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-[var(--text-secondary)]">Build a Link-in-Bio page. Preview in real-time, then copy the HTML to deploy anywhere.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] space-y-3">
              <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Profile</h5>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => document.getElementById('lib-profile-pic')?.click()}>
                  {profileImage ? <img loading="lazy" src={profileImage} alt="Profile photo"  className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-auto text-[var(--text-muted)]" style={{ paddingTop: '18px' }} />}
                </div>
                <input id="lib-profile-pic" type="file" accept="image/*" onChange={handleProfileImage} className="hidden" />
                <div className="flex-1 space-y-2">
                  <input value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name"
                    className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
                  <input value={profileBio} onChange={e => setProfileBio(e.target.value)} placeholder="Short bio"
                    className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] space-y-2">
              <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Palette className="w-3 h-3" /> Theme</h5>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-[var(--text-secondary)]">Background</label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-8 rounded-lg border border-[var(--border-subtle)] cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[var(--text-secondary)]">Card</label>
                  <input type="color" value={cardColor} onChange={e => setCardColor(e.target.value)} className="w-full h-8 rounded-lg border border-[var(--border-subtle)] cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[var(--text-secondary)]">Text</label>
                  <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 rounded-lg border border-[var(--border-subtle)] cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-[var(--text-secondary)]">Accent</label>
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-full h-8 rounded-lg border border-[var(--border-subtle)] cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] space-y-3">
              <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Link className="w-3 h-3" /> Links {links.length > 0 && <span className="font-mono text-[var(--text-secondary)]">({links.length})</span>}</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Link title"
                  className="bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/30" />
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://..."
                  className="bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/30" />
                <select value={newIcon} onChange={e => setNewIcon(e.target.value)}
                  className="bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/30">
                  {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button onClick={addLink}
                  className="px-3 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-emerald-700 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {links.map((l, i) => (
                  <div key={l.id} className="flex items-center gap-2 p-2 bg-white dark:bg-black/50 rounded-lg border border-[var(--border-subtle)]">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveLink(l.id, 'up')} className="text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300"><MoveUp className="w-3 h-3" /></button>
                      <button onClick={() => moveLink(l.id, 'down')} className="text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300"><MoveDown className="w-3 h-3" /></button>
                    </div>
                    <span className="text-[var(--text-muted)]">{ICON_OPTIONS.find(o => o.value === l.icon)?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-[var(--text-primary)] truncate">{l.title}</p>
                      <p className="text-[9px] text-[var(--text-secondary)] truncate">{l.url}</p>
                    </div>
                    <button onClick={() => removeLink(l.id)}
                      className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex bg-zinc-200 dark:bg-zinc-700 rounded-lg p-0.5">
                <button onClick={() => setShowPreview(true)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-colors flex items-center gap-1 ${showPreview ? 'bg-white dark:bg-zinc-600 text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                  <Smartphone className="w-3 h-3" /> Preview
                </button>
                <button onClick={() => setShowPreview(false)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-colors flex items-center gap-1 ${!showPreview ? 'bg-white dark:bg-zinc-600 text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                  <Code className="w-3 h-3" /> HTML
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyHtml}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:bg-emerald-700 transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy HTML'}
                </button>
                <button onClick={handleDownloadHtml}
                  className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  <Download className="w-3 h-3" /> .html
                </button>
              </div>
            </div>

            {showPreview ? (
              <div className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-center min-h-[500px] border-4 border-zinc-800">
                <div className="w-full max-w-[320px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden border-2" style={{ borderColor: accentColor }}>
                      <img loading="lazy" src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName)}&background=${accentColor.replace('#', '')}&color=fff&size=80`} alt="Profile avatar"  className="w-full h-full object-cover" />
                    </div>
                    <p className="text-white text-xl font-bold">{profileName}</p>
                    <p className="text-[var(--text-muted)] text-sm mt-1">{profileBio}</p>
                  </div>
                  <div className="space-y-2.5">
                    {links.map(l => (
                      <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium no-underline transition-transform hover:scale-[1.02] block"
                        style={{ background: cardColor, color: textColor, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-[var(--text-muted)]">{ICON_OPTIONS.find(o => o.value === l.icon)?.icon}</span>
                        <span className="flex-1">{l.title}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className="opacity-40"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                      </a>
                    ))}
                  </div>
                  <p className="text-center text-zinc-600 text-xs mt-6">Made with Toolzum</p>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 rounded-2xl p-4 min-h-[500px] overflow-auto border-4 border-zinc-800">
                <pre className="text-[10px] text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed">{generateHtml}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            <strong>How to deploy:</strong> Copy the HTML and paste into any static host (GitHub Pages, Vercel, Netlify, Cloudflare Pages). Your page is fully self-contained.
            <span className="block mt-1"><strong>Pro:</strong> Auto-hosted on Toolzum subdomain (yourname.toolzum.dev), analytics, custom domain, scheduling, email capture, theme marketplace.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
