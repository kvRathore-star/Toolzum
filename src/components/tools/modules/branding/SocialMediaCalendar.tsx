"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Copy, Check, Calendar, Share2, Download, MessageCircle, Camera, Video, Briefcase, Globe, Image as ImageIcon, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Platform = 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'facebook' | 'other';

const PLATFORM_ICONS: Record<Platform, React.ReactNode> = {
  instagram: <Camera className="w-3.5 h-3.5" />,
  twitter: <MessageCircle className="w-3.5 h-3.5" />,
  linkedin: <Briefcase className="w-3.5 h-3.5" />,
  youtube: <Video className="w-3.5 h-3.5" />,
  facebook: <Globe className="w-3.5 h-3.5" />,
  other: <Globe className="w-3.5 h-3.5" />,
};

interface Post {
  id: string;
  date: string;
  platform: Platform;
  content: string;
  status: 'draft' | 'scheduled' | 'published';
  media?: string;
}

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: 'bg-pink-500',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-600',
  youtube: 'bg-red-600',
  facebook: 'bg-blue-500',
  other: 'bg-[var(--bg-overlay)]0',
};

export default function SocialMediaCalendar() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({ date: '', platform: 'instagram' as Platform, content: '', status: 'draft' as Post['status'] });

  useEffect(() => {
    const saved = localStorage.getItem('social_media_calendar');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved posts from localStorage on mount
    if (saved) { try { setPosts(JSON.parse(saved)); } catch {} }
  }, []);

  const save = (data: Post[]) => {
    setPosts(data);
    localStorage.setItem('social_media_calendar', JSON.stringify(data));
  };

  const addPost = () => {
    if (!form.date || !form.content) return toast.error('Date and content required');
    const newPost: Post = { id: Date.now().toString(), ...form };
    save([...posts, newPost]);
    setForm({ date: '', platform: 'instagram', content: '', status: 'draft' });
    setShowForm(false);
    toast.success('Post added!');
  };

  const updatePost = () => {
    if (!editingId || !form.content) return;
    save(posts.map(p => p.id === editingId ? { ...p, ...form } : p));
    setEditingId(null);
    setShowForm(false);
    setForm({ date: '', platform: 'instagram', content: '', status: 'draft' });
    toast.success('Updated!');
  };

  const deletePost = (id: string) => {
    save(posts.filter(p => p.id !== id));
    toast.success('Deleted');
  };

  const editPost = (post: Post) => {
    setForm({ date: post.date, platform: post.platform, content: post.content, status: post.status });
    setEditingId(post.id);
    setShowForm(true);
  };

  const copyPost = (content: string, id: string) => {
    clipboardWrite(content);
    setCopiedId(id);
    toast.success('Copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const duplicatePost = (post: Post) => {
    const newPost: Post = { ...post, id: Date.now().toString(), date: new Date().toISOString().split('T')[0], status: 'draft' };
    save([...posts, newPost]);
    toast.success('Duplicated!');
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthPosts = posts.filter(p => {
    const d = new Date(p.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  const exportCsv = () => {
    const header = 'Date,Platform,Content,Status';
    const rows = posts.map(p => `"${p.date}","${p.platform}","${p.content.replace(/"/g, '""')}","${p.status}"`);
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_calendar_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Exported!');
  };

  const statusCounts = {
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
  };

  const upcoming = posts.filter(p => p.status !== 'published').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Social Media Calendar</h3>
        </div>
        <button onClick={exportCsv}
          className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(statusCounts).map(([key, count]) => (
            <div key={key} className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <p className="text-2xl font-black text-zinc-800 dark:text-white">{count}</p>
              <p className="text-[9px] text-[var(--text-secondary)] uppercase mt-0.5">{key}</p>
            </div>
          ))}
        </div>

        {!showForm ? (
          <button onClick={() => { setEditingId(null); setForm({ date: new Date().toISOString().split('T')[0], platform: 'instagram', content: '', status: 'draft' }); setShowForm(true); }}
            className="w-full py-3 border-2 border-dashed border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-secondary)] hover:border-emerald-500/50 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" /> New Post
          </button>
        ) : (
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] space-y-3">
            <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{editingId ? 'Edit' : 'New'} Post</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30" />
              <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
                className="bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30">
                {Object.keys(PLATFORM_ICONS).map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Post['status'] }))}
                className="bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={3} placeholder="Post content..."
              className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30 resize-none" />
            <div className="flex gap-2">
              <button onClick={editingId ? updatePost : addPost}
                className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-4 py-2 bg-zinc-200 dark:bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); } else setViewMonth(m => m - 1); }}
            className="text-xs text-[var(--text-secondary)] hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">&larr; Previous</button>
          <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
            {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h5>
          <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); } else setViewMonth(m => m + 1); }}
            className="text-xs text-[var(--text-secondary)] hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Next &rarr;</button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-[9px] font-bold text-[var(--text-muted)] uppercase text-center py-1">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayPosts = monthPosts.filter(p => p.date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            return (
              <div key={day} className={`min-h-[70px] rounded-lg p-1 border text-xs transition-colors ${
                isToday ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)]'
              }`}>
                <p className={`font-bold text-[10px] mb-0.5 ${isToday ? 'text-emerald-600' : 'text-[var(--text-secondary)]'}`}>{day}</p>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 2).map(p => (
                    <div key={p.id} className={`${PLATFORM_COLORS[p.platform]} rounded-sm px-1 py-0.5 text-[7px] text-white truncate cursor-pointer`}
                      role="button" tabIndex={0} title={p.content} onClick={() => editPost(p)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); editPost(p); } }}>
                      {p.status === 'published' ? '✓' : p.status === 'scheduled' ? '⏰' : '○'} {p.platform}
                    </div>
                  ))}
                  {dayPosts.length > 2 && <p className="text-[7px] text-[var(--text-muted)]">+{dayPosts.length - 2} more</p>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Upcoming Posts</h5>
          {upcoming.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] text-center py-4">No upcoming posts. Add your first one!</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(p => (
                <div key={p.id} className="flex items-start gap-3 bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
                  <div className={`w-7 h-7 rounded-full ${PLATFORM_COLORS[p.platform]} flex items-center justify-center text-white shrink-0`}>
                    {PLATFORM_ICONS[p.platform]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-[var(--text-secondary)]">{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                        p.status === 'draft' ? 'bg-zinc-200 dark:bg-zinc-700 text-[var(--text-secondary)]' :
                        p.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>{p.status}</span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] mt-0.5 truncate">{p.content}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => copyPost(p.content, p.id)}
                      className="p-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-[var(--text-secondary)]" />}
                    </button>
                    <button onClick={() => duplicatePost(p)}
                      className="p-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      <Copy className="w-3 h-3 text-[var(--text-secondary)]" />
                    </button>
                    <button onClick={() => editPost(p)}
                      className="p-1.5 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] transition-colors">
                      <Edit3 className="w-3 h-3 text-[var(--text-secondary)]" />
                    </button>
                    <button onClick={() => deletePost(p.id)}
                      className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
            <strong>Pro:</strong> AI content suggestions, auto-schedule with optimal posting times, team collaboration, analytics dashboard, bulk upload via CSV, image upload, multi-account support.
          </p>
        </div>
      </div>
    </div>
  );
}
