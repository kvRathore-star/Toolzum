import {
  Image as ImageIcon,
  FileText,
  Type,
  Mic,
  Video,
  Cpu,
  Code,
  DollarSign,
  Wrench,
  ArrowRightLeft,
  Shield,
  Search,
  Megaphone,
  Sun,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

export const MEGAMENU_ICON_MAP: Record<string, LucideIcon> = {
  image: ImageIcon,
  pdf: FileText,
  video: Video,
  audio: Mic,
  ai: Cpu,
  developer: Code,
  text: Type,
  finance: DollarSign,
  utility: Wrench,
  converter: ArrowRightLeft,
  privacy: Shield,
  seo: Search,
  branding: Megaphone,
  "indian-utilities": Sun,
};

export const MEGAMENU_ICON_COLOR: Record<string, string> = {
  image: "text-purple-500",
  pdf: "text-amber-500",
  video: "text-blue-500",
  audio: "text-pink-500",
  ai: "text-indigo-500",
  developer: "text-cyan-500",
  text: "text-teal-500",
  finance: "text-green-500",
  utility: "text-zinc-500",
  converter: "text-emerald-500",
  privacy: "text-violet-500",
  seo: "text-rose-500",
  branding: "text-fuchsia-500",
  "indian-utilities": "text-[#FF6B35]",
};

export function getMegamenuIcon(iconKey: string): LucideIcon {
  return MEGAMENU_ICON_MAP[iconKey] ?? FileText;
}

export function getMegamenuIconColor(iconKey: string): string {
  return MEGAMENU_ICON_COLOR[iconKey] ?? "text-[var(--text-muted)]";
}
