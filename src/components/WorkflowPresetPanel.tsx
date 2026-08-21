"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Save, FolderOpen, Trash2, X, Crown, Check, ChevronDown, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWorkflowPresets } from '@/hooks/useWorkflowPresets';
import { PresetContext } from '@/context/WorkflowPresetContext';

export function WorkflowPresetPanel({ toolSlug, children }: { toolSlug: string; children: React.ReactNode }) {
  const { presets, savePreset: savePresetRaw, loadPreset: loadPresetRaw, deletePreset, isPro } = useWorkflowPresets(toolSlug);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const [recentlyLoaded, setRecentlyLoaded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const configGetterRef = useRef<(() => Record<string, unknown>) | null>(null);
  const configSetterRef = useRef<((config: Record<string, unknown>) => void) | null>(null);

  useEffect(() => {
    if (showSaveDialog && inputRef.current) inputRef.current.focus();
  }, [showSaveDialog]);

  const registerConfig = useCallback((
    getter: () => Record<string, unknown>,
    setter: (config: Record<string, unknown>) => void,
  ) => {
    configGetterRef.current = getter;
    configSetterRef.current = setter;
  }, []);

  const handleSave = () => {
    if (!presetName.trim()) return;
    const config = configGetterRef.current?.();
    if (!config) { toast.error('No configuration available to save'); return; }
    const saved = savePresetRaw(presetName.trim(), config);
    if (saved) {
      toast.success(`Preset "${presetName.trim()}" saved`);
      setShowSaveDialog(false);
      setPresetName('');
    } else {
      toast.error('Upgrade to Pro to save presets');
    }
  };

  const handleLoad = (id: string) => {
    const config = loadPresetRaw(id);
    if (config && configSetterRef.current) {
      configSetterRef.current(config);
      setRecentlyLoaded(id);
      setShowLoadDropdown(false);
      const preset = presets.find(p => p.id === id);
      toast.success(`Preset "${preset?.name || 'loaded'}" applied`);
      setTimeout(() => setRecentlyLoaded(null), 2000);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    deletePreset(id);
    toast.success(`Preset "${name}" deleted`);
  };

  return (
    <PresetContext.Provider value={{ registerConfig }}>
      <div className="flex flex-col">
        <div className="flex-1">{children}</div>

        <div className="border-t border-[var(--border-subtle)]">
          <div className="px-5 py-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider"
            >
              <Save className="w-3 h-3" />
              Workflow Presets
              <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                {presets.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowLoadDropdown(!showLoadDropdown)}
                      className="flex items-center gap-2 text-xs text-[var(--text-primary)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2 hover:border-[var(--border-default)] transition-colors w-full"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="flex-1 text-left">Load Preset</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{presets.length}</span>
                    </button>

                    {showLoadDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] shadow-lg z-50 overflow-hidden">
                        {presets.map(p => (
                          <button
                            key={p.id}
                            onClick={() => handleLoad(p.id)}
                            className={`flex items-center gap-2 w-full text-xs text-left px-3 py-2.5 hover:bg-[var(--bg-overlay)] transition-colors ${
                              recentlyLoaded === p.id ? 'bg-[var(--accent-ink)]/10 text-[var(--accent)]' : ''
                            }`}
                          >
                            <Check className={`w-3 h-3 ${recentlyLoaded === p.id ? 'opacity-100' : 'opacity-0'}`} />
                            <span className="flex-1 truncate">{p.name}</span>
                            <button
                              onClick={(e) => handleDelete(e, p.id, p.name)}
                              className="text-[var(--text-muted)] hover:text-red-700 dark:hover:text-red-400 transition-colors p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {isPro ? (
                  <>
                    <button
                      onClick={() => setShowSaveDialog(true)}
                      className="flex items-center gap-2 text-xs text-white bg-[var(--accent-ink)] rounded-[var(--radius-md)] px-3 py-2 hover:opacity-90 transition-opacity w-full"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Current Config as Preset
                    </button>

                    {showSaveDialog && (
                      <div className="flex items-center gap-2 animate-in fade-in duration-150">
                        <input
                          ref={inputRef}
                          value={presetName}
                          onChange={e => setPresetName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleSave()}
                          placeholder="e.g. Shopify 800x800..."
                          className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                        />
                        <button
                          onClick={handleSave}
                          className="text-xs text-white bg-emerald-700 rounded-[var(--radius-md)] px-3 py-2 hover:bg-emerald-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowSaveDialog(false)}
                          className="text-xs text-[var(--text-muted)] p-2 hover:text-[var(--text-primary)] transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Unlock with Pro to save and load custom presets</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { name: 'Optimized 800x800', desc: 'Square crop, WebP, 80% quality' },
                        { name: 'Social Media Banner', desc: '1200x630, JPG, max quality' },
                        { name: 'Email Safe', desc: 'PNG, under 500KB, no metadata' },
                        { name: 'Quick Compress', desc: 'Reduce size 60%, keep format' },
                      ].map((preset) => (
                        <div
                          key={preset.name}
                          className="flex items-center gap-2 text-xs bg-[var(--bg-base)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-md)] px-3 py-2 opacity-50 cursor-not-allowed"
                        >
                          <Lock className="w-3 h-3 text-amber-500/60 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[var(--text-muted)] truncate font-medium">{preset.name}</div>
                            <div className="text-[10px] text-[var(--text-muted)]/60 truncate">{preset.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/pricing"
                      className="block text-center text-xs text-[var(--accent)] hover:underline font-medium pt-1"
                    >
                      Upgrade to Pro →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PresetContext.Provider>
  );
}
