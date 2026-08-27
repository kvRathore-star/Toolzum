"use client";

import React, { useState } from "react";
import { FileText, ArrowUp } from "lucide-react";

interface Section {
  id: string;
  title: string;
}

interface DocumentSidebarProps {
  sections: Section[];
}

export function DocumentSidebar({ sections }: DocumentSidebarProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Sticky Sidebar Navigation */}
      <div className="md:col-span-4 sticky top-28 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 hidden md:block">
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-4 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Document Sections
        </h3>
        <ul className="space-y-3">
          {sections.map((sec) => (
            <li key={sec.id}>
              <button
                onClick={() => scrollTo(sec.id)}
                className={`w-full text-left text-xs font-medium transition-colors hover:text-white ${
                  activeSection === sec.id 
                  ? "text-[var(--accent)] font-semibold" 
                  : "text-[var(--text-secondary)]"
                }`}
              >
                {sec.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Scroll back to top button - rendered at the end of content */}
      <div className="flex justify-center border-t border-[var(--border-subtle)] pt-8 mt-12">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5" /> Back to Top
        </button>
      </div>
    </>
  );
}
