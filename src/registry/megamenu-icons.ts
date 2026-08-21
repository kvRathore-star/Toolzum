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

export function getMegamenuIcon(iconKey: string): LucideIcon {
  return MEGAMENU_ICON_MAP[iconKey] ?? FileText;
}
