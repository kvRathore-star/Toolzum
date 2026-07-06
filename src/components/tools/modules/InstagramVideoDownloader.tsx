"use client";

import React, { useState } from 'react';
import { Download, Copy, Check, User, Camera, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function InstagramProfilePicDownloader() {
  const [username, setUsername] = useState('');
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const resolveProfilePic = async () => {
    const u = username.trim().replace('@', '').replace('https://instagram.com/', '').replace(/\/$/, '');
    if (!u) return toast.error('Enter a username');
    setIsLoading(true);
    setError('');
    setProfileUrl(null);

    try {
      const response = await fetch(
        `https://www.instagram.com/${u}/?__a=1&__d=1`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (!response.ok) {
        // Fallback: use direct CDN URL
        const fallbackUrl = `https://www.instagram.com/${u}/`;
        const fallbackResp = await fetch(fallbackUrl);
        if (!fallbackResp.ok) throw new Error('Profile not found or private');
        const html = await fallbackResp.text();
        const match = html.match(/(?:profile_pic_url|profile_pic_url_hd)["']?\s*:\s*["']([^"']+)/i);
        if (match) {
          setProfileUrl(match[1].replace(/\\u0026/g, '&'));
          toast.success('Profile picture found!');
        } else {
          throw new Error('Could not extract profile picture');
        }
      } else {
        const data: any = await response.json();
        const hdUrl = data?.graphql?.user?.profile_pic_url_hd;
        if (hdUrl) {
          setProfileUrl(hdUrl);
          toast.success('Profile picture found!');
        } else {
          throw new Error('Could not find profile picture');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Could not fetch profile. Username may not exist or account is private.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!profileUrl) return;
    downloadOrShare(profileUrl, `instagram_${username.replace('@', '')}_profile.jpg`);
    toast.success('Downloading...');
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Camera className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Instagram Profile Pic Downloader</h3>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Download public Instagram profile pictures in high resolution. Enter any public Instagram username — no login required, completely legal.
        </p>

        <div className="flex gap-2">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username or @username or instagram.com/username"
            className="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
            onKeyDown={e => e.key === 'Enter' && resolveProfilePic()} />
          <button onClick={resolveProfilePic} disabled={isLoading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap">
            {isLoading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" /></svg> Searching...</> : <>Get Picture</>}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
            <p className="text-[10px] text-amber-600 dark:text-amber-400">{error}</p>
          </div>
        )}

        {profileUrl && (
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-zinc-50 dark:bg-black/30 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
              <img src={profileUrl} alt={`@${username} profile`}
                className="w-48 h-48 rounded-full object-cover border-4 border-zinc-200 dark:border-zinc-700 shadow-xl" />
            </div>
            <button onClick={handleDownload}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
              <Download className="w-4 h-4" /> Download HD Profile Picture
            </button>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
            <strong>Pro:</strong> Bulk download profile pics from a list of usernames, AI-powered username search, story profile pic history, high-res export up to 4K.
          </p>
        </div>
      </div>
    </div>
  );
}
