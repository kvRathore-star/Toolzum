export type ToolCategory =
  | "PDF"
  | "Image"
  | "Text"
  | "Developer"
  | "Finance"
  | "Utility"
  | "Converter"
  | "Video"
  | "Audio"
  | "Branding"
  | "Productivity"
  | "Privacy"
  | "Design"
  | "Transcription"
  | "Extension"
  | "SEO"
  | "indian-utilities"
  | "AI"
  | "Health"
  | "Calculator"
  | "Growth & Marketing";

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  dependencies: string;
  isPro?: boolean;
  instructions?: { title: string; desc: string }[];
  faqs?: { question: string; answer: string }[];
  seoDescription?: string;
  showInCategory?: boolean;
}

