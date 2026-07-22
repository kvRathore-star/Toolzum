#!/usr/bin/env node
// Mechanical CSS-var migration for tool module files.
// Maps legacy Tailwind color patterns to design-system CSS custom properties.
// Run: node scripts/viz-migrate.js [file-or-glob]
//
// Usage examples:
//   node scripts/viz-migrate.js "src/components/tools/modules/AgeCalculator.tsx"
//   node scripts/viz-migrate.js "src/components/tools/modules/shared/*.tsx"
//   node scripts/viz-migrate.js "src/components/tools/modules/Calc*.tsx"

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const targetGlob = process.argv[2];
if (!targetGlob) {
  console.error('Usage: node scripts/viz-migrate.js <glob-pattern>');
  process.exit(1);
}

const files = globSync(targetGlob, { ignore: ['node_modules/**'] });
if (files.length === 0) {
  console.error(`No files matched: ${targetGlob}`);
  process.exit(1);
}

console.log(`Migrating ${files.length} files...`);

// Order matters — more specific patterns first, then general.
// Each rule: [pattern, replacement]
// The replacements MUST preserve JSX structural correctness.

const replacements = [
  // === Container/Card wrappers ===
  [/bg-white\s+dark:bg-zinc-900/g, 'bg-[var(--bg-elevated)]'],

  // === Panel/Inner section backgrounds ===
  // bg-zinc-50 with dark variant → overlay
  [/bg-zinc-50\s+dark:bg-black\/30/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-black\/20/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-black\/10/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-black\/40/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-black\/50/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-black/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-zinc-900\/50/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-zinc-800/g, 'bg-[var(--bg-overlay)]'],
  [/bg-zinc-50\s+dark:bg-zinc-800\/50/g, 'bg-[var(--bg-overlay)]'],
  // bare bg-zinc-50 (no dark variant needed or dark handled separately)
  [/bg-zinc-50/g, 'bg-[var(--bg-overlay)]'],

  // bg-zinc-100 with dark variant → surface
  [/bg-zinc-100\s+dark:bg-zinc-800/g, 'bg-[var(--bg-surface)]'],
  [/bg-zinc-100\s+dark:bg-zinc-800\/50/g, 'bg-[var(--bg-surface)]'],
  [/bg-zinc-100\s+dark:bg-black\/50/g, 'bg-[var(--bg-surface)]'],

  // === Dark-mode-only backgrounds ===
  [/dark:bg-zinc-800/g, 'dark:bg-[var(--bg-surface)]'],
  [/dark:bg-zinc-900\/50/g, 'dark:bg-[var(--bg-overlay)]'],
  [/dark:bg-black\/45/g, 'dark:bg-[var(--bg-overlay)]'],

  // === Text colors ===
  // Primary text (dark text on light, white on dark)
  [/text-zinc-900\s+dark:text-white/g, 'text-[var(--text-primary)]'],
  // Secondary text
  [/text-zinc-500\s+dark:text-zinc-400/g, 'text-[var(--text-secondary)]'],
  [/text-zinc-500\s+dark:text-zinc-300/g, 'text-[var(--text-secondary)]'],
  [/text-zinc-400\s+dark:text-zinc-300/g, 'text-[var(--text-secondary)]'],
  // Button text variant
  [/text-zinc-700\s+dark:text-zinc-300/g, 'text-[var(--text-primary)]'],
  [/text-zinc-700\s+dark:text-zinc-200/g, 'text-[var(--text-primary)]'],
  // Muted text
  [/text-zinc-400\s+dark:text-zinc-500/g, 'text-[var(--text-muted)]'],
  [/text-zinc-400\s+dark:text-zinc-400/g, 'text-[var(--text-muted)]'],
  // bare
  [/text-zinc-400/g, 'text-[var(--text-muted)]'],
  [/text-zinc-500/g, 'text-[var(--text-secondary)]'],
  [/text-zinc-600\s+dark:text-zinc-400/g, 'text-[var(--text-secondary)]'],

  // Accent-colored text → accent var
  [/text-indigo-500/g, 'text-[var(--accent)]'],
  [/text-indigo-600/g, 'text-[var(--accent)]'],
  [/text-indigo-400/g, 'text-[var(--accent)]'],
  [/text-rose-500/g, 'text-[var(--accent)]'],

  // === Borders ===
  [/border-zinc-200\s+dark:border-zinc-800/g, 'border-[var(--border-subtle)]'],
  [/border-zinc-200\s+dark:border-white\/10/g, 'border-[var(--border-subtle)]'],
  [/border-zinc-200\s+dark:border-zinc-700/g, 'border-[var(--border-subtle)]'],
  [/border-zinc-100\s+dark:border-zinc-800/g, 'border-[var(--border-subtle)]'],
  // focus borders
  [/focus:border-blue-500/g, 'focus:border-[var(--accent)]'],
  [/focus:border-emerald-500\/50/g, 'focus:border-[var(--accent)]/50'],

  // === Primary CTAs ===
  [/bg-blue-600\s+hover:bg-blue-700/g, 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'],
  [/bg-indigo-600\s+hover:bg-indigo-700/g, 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'],
  [/bg-indigo-500\s+hover:bg-indigo-600/g, 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'],
  [/bg-rose-500\s+hover:bg-rose-600/g, 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'],
  [/bg-rose-600\s+hover:bg-rose-700/g, 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'],

  // Hover bg states
  [/hover:bg-zinc-200\s+dark:hover:bg-zinc-700/g, 'hover:bg-[var(--bg-surface)]'],
  [/hover:bg-zinc-100\s+dark:hover:bg-zinc-800/g, 'hover:bg-[var(--bg-surface)]'],
  [/hover:bg-indigo-600/g, 'hover:bg-[var(--accent-hover)]'],

  // === Secondary buttons ===
  [/bg-zinc-100\s+dark:bg-zinc-800\s+hover:bg-zinc-200\s+dark:hover:bg-zinc-700/g, 'bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)]'],
  [/bg-zinc-100\s+hover:bg-zinc-200\s+dark:bg-zinc-800\s+dark:hover:bg-zinc-700/g, 'bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)]'],

  // === Success/notification badges (keep semantic colors but use var patterns) ===
  // bg-emerald-50 dark:bg-emerald-950/20 → keep as-is (semantic)
  // bg-amber-50 dark:bg-amber-950/20 → keep as-is
  // text-emerald-600 dark:text-emerald-400 → keep as-is

  // === Remaining edge cases ===
  [/dark:border-white\/10/g, 'dark:border-[var(--border-subtle)]'],
  [/dark:border-white\/5/g, 'dark:border-[var(--border-subtle)]'],
  [/bg-white\s+dark:bg-zinc-700/g, 'bg-[var(--bg-elevated)]'],
  [/hover:text-zinc-700\s+dark:hover:text-zinc-300/g, 'hover:text-[var(--text-primary)]'],
  [/focus:ring-blue-500\/50/g, 'focus:ring-[var(--accent)]/50'],
  // standalone border-zinc-200 with dark already done via var
  [/border-zinc-200\s+dark:border-\[\$]/g, 'border-[var(--border-subtle)]'],
  // hover:bg-zinc-700 with dark not needed (dark theme stays dark)
  [/hover:bg-zinc-700/g, 'hover:bg-[var(--bg-elevated)]'],
];

let migrated = 0;
let errors = 0;

for (const filePath of files) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;

    for (const [pattern, replacement] of replacements) {
      content = content.replace(pattern, replacement);
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`  ✓ ${path.relative(process.cwd(), filePath)}`);
      migrated++;
    } else {
      console.log(`  - ${path.relative(process.cwd(), filePath)} (no changes)`);
    }
  } catch (err) {
    console.error(`  ✗ ${path.relative(process.cwd(), filePath)}: ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. ${migrated} files modified, ${errors} errors.`);
