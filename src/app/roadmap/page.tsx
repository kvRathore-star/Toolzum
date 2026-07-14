"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronUp, 
  Map, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  RotateCw,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  tagColor: string;
  votes: number;
}

const PLANNED: RoadmapItem[] = [
  {
    id: "whisper-wasm",
    title: "Offline Audio Transcriber",
    description: "Utilize localized Whisper.js neural models running on WebGPU for speech-to-text dictation without any API usage.",
    tag: "AI Model",
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    votes: 421
  },
  {
    id: "vector-pen",
    title: "Multi-page Vector Pen Canvas",
    description: "Draw complex vector diagrams and export SVG files directly from an advanced freeform design pad.",
    tag: "Design Suite",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    votes: 289
  },
  {
    id: "sqlite-import",
    title: "CSV to SQLite Web Terminal",
    description: "Drag CSV files and queries into a local SQL editor sandbox compiling database files inside memory via WebAssembly.",
    tag: "Dev Utility",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    votes: 194
  }
];

const DEVELOPING: RoadmapItem[] = [
  {
    id: "temp-email",
    title: "Temporary Email Generator",
    description: "Generate disposable email addresses that receive mail in-browser. Requires a server-side SMTP relay — planned for next release cycle.",
    tag: "Utility",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    votes: 342
  },
  {
    id: "browser-ext",
    title: "Toolzum Browser Extension",
    description: "Chrome extension bringing color picker, screenshot capture, QR encoding, and quick tool access into your browser toolbar.",
    tag: "Extension",
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    votes: 287
  },
  {
    id: "webp-pipeline",
    title: "Batch WebP / AVIF Optimizer",
    description: "Multi-threaded worker threads executing image format compression across dozens of files in parallel.",
    tag: "Performance",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    votes: 382
  },
  {
    id: "pdf-sign",
    title: "Offline PDF Signature Ink",
    description: "Draw or load custom signature vectors onto PDF documents, saving signed files locally in seconds.",
    tag: "PDF Suite",
    tagColor: "bg-red-500/10 text-red-400 border-red-500/20",
    votes: 512
  }
];

const COMPLETED: RoadmapItem[] = [
  {
    id: "background-remove",
    title: "WebGL AI Background Remover",
    description: "Identify and transparentize photographic backgrounds using local browser image segmentation tensors.",
    tag: "AI Model",
    tagColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    votes: 681
  },
  {
    id: "dev-formatters",
    title: "Developer Formatters Drawer",
    description: "Minify and expand CSS, HTML, JS, and JSON codes using quick-copy dev nodes.",
    tag: "Dev Utility",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    votes: 318
  }
];

export default function RoadmapPage() {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [userUpvoted, setUserUpvoted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Read upvotes from localStorage
    const savedVotes = localStorage.getItem("th_roadmap_votes");
    const savedUserVotes = localStorage.getItem("th_roadmap_user_votes");
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
    if (savedUserVotes) {
      setUserUpvoted(JSON.parse(savedUserVotes));
    }
  }, []);

  const handleUpvote = (itemId: string, initialVotes: number) => {
    const isUpvoted = !!userUpvoted[itemId];
    const newVotes = { ...votes };
    const newUserUpvoted = { ...userUpvoted };

    if (isUpvoted) {
      // Undo vote
      newVotes[itemId] = (votes[itemId] ?? initialVotes) - 1;
      newUserUpvoted[itemId] = false;
    } else {
      // Add vote
      newVotes[itemId] = (votes[itemId] ?? initialVotes) + 1;
      newUserUpvoted[itemId] = true;
    }

    setVotes(newVotes);
    setUserUpvoted(newUserUpvoted);

    localStorage.setItem("th_roadmap_votes", JSON.stringify(newVotes));
    localStorage.setItem("th_roadmap_user_votes", JSON.stringify(newUserUpvoted));
  };

  const renderColumn = (
    title: string, 
    icon: React.ComponentType<{ className?: string }>, 
    items: RoadmapItem[],
    headingColor: string
  ) => {
    const Icon = icon;
    return (
      <div className="flex flex-col gap-6 flex-1 min-w-[280px]">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${headingColor}`} />
            <h3 className="font-semibold text-sm">{title}</h3>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
            {items.length}
          </span>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const currentVoteCount = votes[item.id] ?? item.votes;
            const hasVoted = !!userUpvoted[item.id];
            
            return (
              <div 
                key={item.id} 
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 rounded-[var(--radius-xl)] p-5 shadow-sm transition-all duration-300 flex items-start gap-4 group"
              >
                
                {/* Interactive Upvote Box */}
                <button
                  onClick={() => handleUpvote(item.id, item.votes)}
                  className={`flex flex-col items-center justify-center p-2 rounded-[var(--radius-md)] border shrink-0 transition-all ${
                    hasVoted 
                    ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)]" 
                    : "bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white"
                  }`}
                >
                  <ChevronUp className={`w-4 h-4 transition-transform group-hover:-translate-y-0.5 ${hasVoted ? "scale-110" : ""}`} />
                  <span className="text-[10px] font-bold font-mono mt-1">{currentVoteCount}</span>
                </button>

                {/* Card Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm text-[var(--text-primary)] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Map className="w-3.5 h-3.5" /> Interactive Roadmap
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Feature Roadmap
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Explore planned expansions, vote for features you want prioritize, and trace what is actively rolling out.
          </p>
        </div>

        {/* Kanban Board Container */}
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-24 overflow-x-auto pb-4">
          {renderColumn("Planned / Brainstorming", FolderOpen, PLANNED, "text-blue-400")}
          {renderColumn("In Development", RotateCw, DEVELOPING, "text-amber-400")}
          {renderColumn("Completed / Shipped", CheckCircle2, COMPLETED, "text-emerald-400")}
        </div>

        {/* Suggestion CTA */}
        <div className="max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px]" />
          <h3 className="text-2xl font-semibold mb-3">Have a feature request?</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto mb-6">
            If you need an offline tool that isn't on the roadmap, let us know! We design open-source, client-side algorithms based on community requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="e.g. SVG pattern generator..." 
              className="flex-1 bg-[var(--bg-base)] text-sm border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" 
            />
            <Button disabled className="shrink-0 opacity-60 cursor-not-allowed">Submit Request</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
