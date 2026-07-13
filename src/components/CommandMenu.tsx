"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Sparkles, Zap, Layout, Sun, Moon, Home, CornerDownLeft } from "lucide-react";
import { toolsRegistry } from "@/registry/tools";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    const onCommand = () => setOpen(true);

    document.addEventListener("keydown", onKey);
    document.addEventListener("opencode-command", onCommand);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("opencode-command", onCommand);
    };
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  // Group tools by category
  const categories = React.useMemo(() => {
    const groups: Record<string, typeof toolsRegistry> = {};
    toolsRegistry.forEach((tool) => {
      if (!groups[tool.category]) {
        groups[tool.category] = [];
      }
      groups[tool.category].push(tool);
    });
    return groups;
  }, []);

  if (!open) {
    // We register the global trigger button check inside other components.
    // The dialog itself only mounts or registers here.
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-[13px] text-[var(--text-muted)] bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer w-48 hover:w-64 focus:w-64 justify-between"
      >
        <span className="flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          <span>Search tools...</span>
        </span>
        <kbd className="font-mono text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Search Button for display */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-[13px] text-[var(--text-muted)] bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer w-48 hover:w-64 focus:w-64 justify-between"
      >
        <span className="flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          <span>Search tools...</span>
        </span>
        <kbd className="font-mono text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]">
          ⌘K
        </kbd>
      </button>

      {/* Cmdk Dialog Overlay */}
      <div 
        className="fixed inset-0 z-[100] bg-[var(--bg-base)]/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4"
        onClick={() => setOpen(false)}
      >
        <div 
          className="w-[calc(100%-2rem)] max-w-[600px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col max-h-[60vh] mt-[10vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <Command className="flex flex-col h-full">
            <div className="flex items-center border-b border-[var(--border-subtle)] px-4">
              <Search className="w-5 h-5 text-[var(--text-muted)] mr-3 shrink-0" />
              <Command.Input
                autoFocus
                placeholder="Search tools, categories, or actions..."
                className="w-full py-5 text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-transparent border-none outline-none focus:ring-0 text-[18px]"
              />
            </div>

            <Command.List className="overflow-y-auto p-2 flex-1 scrollbar-thin scrollbar-thumb-[var(--border-subtle)]">
              <Command.Empty className="py-12 text-center text-sm text-[var(--text-muted)]">
                No matching tools or settings found.
              </Command.Empty>

              <Command.Group heading="Actions" className="px-2 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]">
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/"))}
                  className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                >
                  <Home className="w-4 h-4 text-[var(--text-muted)] mr-3" />
                  <span className="flex-1 font-medium">Go to Home Page</span>
                  <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded">Action</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}
                  className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[var(--text-muted)] mr-3" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--text-muted)] mr-3" />
                  )}
                  <span className="flex-1 font-medium">Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
                  <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded">Theme</span>
                </Command.Item>
              </Command.Group>

              {Object.entries(categories).map(([category, items]) => (
                <Command.Group
                  key={category}
                  heading={category === "indian-utilities" ? "India Utilities" : category}
                  className="mt-2 px-2 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]"
                >
                  {items.map((tool) => (
                    <Command.Item
                      key={tool.id}
                      onSelect={() =>
                        runCommand(() =>
                          router.push(
                            `/${tool.category.toLowerCase().replace(/\s+/g, "-")}/${tool.slug}`
                          )
                        )
                      }
                      className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors group"
                    >
                      {tool.category === "AI" ? (
                        <Sparkles className="w-4 h-4 text-violet-500 mr-3 group-data-[selected=true]:text-[var(--accent)]" />
                      ) : tool.category === "indian-utilities" ? (
                        <Zap className="w-4 h-4 text-[var(--india)] mr-3 group-data-[selected=true]:text-[var(--accent)]" />
                      ) : (
                        <Layout className="w-4 h-4 text-blue-500 mr-3 group-data-[selected=true]:text-[var(--accent)]" />
                      )}
                      <span className="font-medium flex-1 text-left">{tool.name}</span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)] px-2 bg-[var(--bg-overlay)] rounded-full">
                        {tool.category}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            <div className="border-t border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-overlay)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <div className="flex gap-4">
                <span>↑↓ navigate</span>
                <span>Enter select</span>
              </div>
              <div>
                <span>Esc close</span>
              </div>
            </div>
          </Command>
        </div>
      </div>
    </>
  );
}
