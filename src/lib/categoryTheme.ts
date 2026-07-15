import {
  Image as ImageIcon,
  FileText,
  Type,
  Mic,
  Video,
  Cpu,
  Sun,
  ArrowLeftRight,
  Code,
  Shield,
  Download,
  Puzzle,
  Search,
  Wrench,
  Heart,
  Users,
  DollarSign,
  CheckSquare,
  Briefcase,
  ShoppingCart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryTheme {
  icon: LucideIcon;
  iconColor: string;
  bgTint: string;
  gradientHover: string;
}

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  Image: {
    icon: ImageIcon,
    iconColor: "text-purple-500",
    bgTint: "bg-purple-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-purple-500/5",
  },
  PDF: {
    icon: FileText,
    iconColor: "text-amber-500",
    bgTint: "bg-amber-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-amber-500/5",
  },
  Text: {
    icon: Type,
    iconColor: "text-teal-500",
    bgTint: "bg-teal-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-teal-500/5",
  },
  Audio: {
    icon: Mic,
    iconColor: "text-pink-500",
    bgTint: "bg-pink-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-pink-500/5",
  },
  Video: {
    icon: Video,
    iconColor: "text-blue-500",
    bgTint: "bg-blue-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-blue-500/5",
  },
  AI: {
    icon: Cpu,
    iconColor: "text-indigo-500",
    bgTint: "bg-indigo-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-indigo-500/5",
  },
  "indian-utilities": {
    icon: Sun,
    iconColor: "text-[#FF6B35]",
    bgTint: "bg-[#FF6B35]/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-[#FF6B35]/5",
  },
  Developer: {
    icon: Code,
    iconColor: "text-cyan-500",
    bgTint: "bg-cyan-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-cyan-500/5",
  },
  Downloader: {
    icon: Download,
    iconColor: "text-sky-500",
    bgTint: "bg-sky-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-sky-500/5",
  },
  Privacy: {
    icon: Shield,
    iconColor: "text-violet-500",
    bgTint: "bg-violet-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-violet-500/5",
  },
  Extension: {
    icon: Puzzle,
    iconColor: "text-fuchsia-500",
    bgTint: "bg-fuchsia-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-fuchsia-500/5",
  },
  SEO: {
    icon: Search,
    iconColor: "text-rose-500",
    bgTint: "bg-rose-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-rose-500/5",
  },
  Finance: {
    icon: DollarSign,
    iconColor: "text-green-500",
    bgTint: "bg-green-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-green-500/5",
  },
  Utility: {
    icon: Wrench,
    iconColor: "text-zinc-500",
    bgTint: "bg-zinc-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-zinc-500/5",
  },
  Productivity: {
    icon: CheckSquare,
    iconColor: "text-teal-500",
    bgTint: "bg-teal-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-teal-500/5",
  },
  Health: {
    icon: Heart,
    iconColor: "text-red-500",
    bgTint: "bg-red-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-red-500/5",
  },
  HR: {
    icon: Users,
    iconColor: "text-stone-500",
    bgTint: "bg-stone-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-stone-500/5",
  },
  Business: {
    icon: Briefcase,
    iconColor: "text-slate-500",
    bgTint: "bg-slate-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-slate-500/5",
  },
  "E-commerce": {
    icon: ShoppingCart,
    iconColor: "text-green-500",
    bgTint: "bg-green-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-green-500/5",
  },
  Converter: {
    icon: ArrowLeftRight,
    iconColor: "text-emerald-500",
    bgTint: "bg-emerald-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-emerald-500/5",
  },
  Transcription: {
    icon: FileText,
    iconColor: "text-sky-500",
    bgTint: "bg-sky-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-sky-500/5",
  },
  Marketing: {
    icon: Search,
    iconColor: "text-rose-500",
    bgTint: "bg-rose-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-rose-500/5",
  },
  Design: {
    icon: ImageIcon,
    iconColor: "text-rose-500",
    bgTint: "bg-rose-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-rose-500/5",
  },
  Branding: {
    icon: ImageIcon,
    iconColor: "text-fuchsia-500",
    bgTint: "bg-fuchsia-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-fuchsia-500/5",
  },
  Lifestyle: {
    icon: Sun,
    iconColor: "text-yellow-500",
    bgTint: "bg-yellow-500/10",
    gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-yellow-500/5",
  },
};

const DEFAULT_THEME: CategoryTheme = {
  icon: ArrowLeftRight,
  iconColor: "text-[var(--text-muted)]",
  bgTint: "bg-[var(--bg-overlay)]",
  gradientHover: "hover:bg-gradient-to-br hover:from-[var(--bg-elevated)] hover:to-orange-500/5",
};

export const CATEGORY_GROUPS: Record<string, { label: string; order: number }> = {
  PDF: { label: 'Media', order: 0 },
  Image: { label: 'Media', order: 0 },
  Video: { label: 'Media', order: 0 },
  Audio: { label: 'Media', order: 0 },
  'indian-utilities': { label: 'India 🇮🇳', order: 1 },
  Text: { label: 'Text & AI', order: 2 },
  Transcription: { label: 'Text & AI', order: 2 },
  AI: { label: 'Text & AI', order: 2 },
  Developer: { label: 'Developer & Tech', order: 3 },
  SEO: { label: 'Developer & Tech', order: 3 },
  Extension: { label: 'Developer & Tech', order: 3 },
  Finance: { label: 'Business & Finance', order: 4 },
  Business: { label: 'Business & Finance', order: 4 },
  HR: { label: 'Business & Finance', order: 4 },
  'E-commerce': { label: 'Business & Finance', order: 4 },
  Marketing: { label: 'Business & Finance', order: 4 },
  Branding: { label: 'Business & Finance', order: 4 },
  Utility: { label: 'Tools & Converters', order: 5 },
  Converter: { label: 'Tools & Converters', order: 5 },
  Downloader: { label: 'Tools & Converters', order: 5 },
  Design: { label: 'Lifestyle', order: 6 },
  Productivity: { label: 'Lifestyle', order: 6 },
  Privacy: { label: 'Lifestyle', order: 6 },
  Health: { label: 'Lifestyle', order: 6 },
  Lifestyle: { label: 'Lifestyle', order: 6 },
};

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'e-commerce': 'E-Commerce',
  'ai': 'AI Tools',
  'transcription': 'Transcription',
  'branding': 'Branding & Marketing',
  'productivity': 'Productivity',
};

export const GROUP_ORDER = ['Media', 'India 🇮🇳', 'Text & AI', 'Developer & Tech', 'Business & Finance', 'Tools & Converters', 'Lifestyle'];

export function getCategoryGroup(category: string): string {
  return CATEGORY_GROUPS[category]?.label ?? 'Other';
}

export function getGroupedCategories(categories: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  [...categories].sort().forEach(c => {
    const group = getCategoryGroup(c);
    if (!groups[group]) groups[group] = [];
    groups[group].push(c);
  });
  return groups;
}

export function getCategoryTheme(category: string): CategoryTheme {
  return CATEGORY_THEMES[category] ?? DEFAULT_THEME;
}
