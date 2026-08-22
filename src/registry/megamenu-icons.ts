import {
  ImageIcon,
  FileText,
  Video,
  Music,
  Bot,
  Code2,
  Pen,
  DollarSign,
  Wrench,
  ArrowRightLeft,
  Lock,
  TrendingUp,
  Palette,
  Sun,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export const MEGAMENU_ICON_MAP: Record<string, LucideIcon> = {
  image: ImageIcon,
  pdf: FileText,
  video: Video,
  audio: Music,
  ai: Bot,
  developer: Code2,
  text: Pen,
  finance: DollarSign,
  utility: Wrench,
  converter: ArrowRightLeft,
  privacy: Lock,
  seo: TrendingUp,
  branding: Palette,
  "indian-utilities": Sun,
};

export const MEGAMENU_ICON_COLOR: Record<string, string> = {
  image: "text-sky-500",
  pdf: "text-red-500",
  video: "text-purple-500",
  audio: "text-emerald-500",
  ai: "text-violet-500",
  developer: "text-amber-500",
  text: "text-blue-500",
  finance: "text-green-500",
  utility: "text-zinc-400",
  converter: "text-orange-500",
  privacy: "text-rose-500",
  seo: "text-teal-500",
  branding: "text-pink-500",
  "indian-utilities": "text-orange-500",
};

export function getMegamenuIcon(iconKey: string): LucideIcon {
  return MEGAMENU_ICON_MAP[iconKey] ?? FileText;
}

export function getMegamenuIconColor(iconKey: string): string {
  return MEGAMENU_ICON_COLOR[iconKey] ?? "text-[var(--text-muted)]";
}
