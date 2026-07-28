import {
  ArrowRight, ShieldCheck, Zap, Server,
  Upload, Download, Lock, Layers, Globe, Palette, BarChart3,
  FileType, Image as ImageIcon, Video, Mic, Cpu, FileText, Code,
  Type, Shield, Search, Wrench, DollarSign, Heart, CheckSquare,
  Calculator as CalculatorIcon, MapPin
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryDef {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
}

export interface StepDef {
  num: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface WhyChooseDef {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface FeatureDef {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface UseCaseDef {
  title: string;
  items: string[];
  slug: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'Image', label: 'Image', icon: ImageIcon, desc: 'Resize, crop, convert & optimize images' },
  { id: 'PDF', label: 'PDF', icon: FileText, desc: 'Compress, merge, split & convert PDFs' },
  { id: 'AI', label: 'AI Tools', icon: Cpu, desc: 'Generate, summarize & analyze with AI' },
  { id: 'Video', label: 'Video', icon: Video, desc: 'Trim, compress & transcode videos' },
  { id: 'Audio', label: 'Audio', icon: Mic, desc: 'Convert, cut & enhance audio files' },
  { id: 'Converter', label: 'Convert', icon: FileType, desc: 'Convert between 50+ formats' },
  { id: 'Developer', label: 'Developer', icon: Code, desc: 'Format, minify & debug code' },
  { id: 'Calculator', label: 'Calculator', icon: CalculatorIcon, desc: 'Math, stats, finance & unit converters' },
  { id: 'Finance', label: 'Finance', icon: DollarSign, desc: 'Currency rates, GST, loans & budgeting' },
  { id: 'Health', label: 'Health', icon: Heart, desc: 'BMI, calories, body fat & fitness trackers' },
  { id: 'Text', label: 'Text', icon: Type, desc: 'Word counter, citation gen, text styling & more' },
  { id: 'Utility', label: 'Utility', icon: Wrench, desc: 'Password gen, QR codes, UUIDs & everyday tools' },
  { id: 'Privacy', label: 'Privacy', icon: Shield, desc: 'Metadata remover, ad blocker & privacy cleaners' },
  { id: 'SEO', label: 'SEO', icon: Search, desc: 'Keyword tools, meta tags, robots.txt & audits' },
  { id: 'Design', label: 'Design', icon: Palette, desc: 'Color palettes, gradients & typography tools' },
  { id: 'Branding', label: 'Branding', icon: BarChart3, desc: 'Logos, business cards, brand kits & social media assets' },
  { id: 'Growth & Marketing Metrics', label: 'Growth & Marketing', icon: BarChart3, desc: 'ARR, MRR, LTV, CAC, CPM, ROAS & SaaS analytics' },
  { id: 'Transcription', label: 'Transcription', icon: Mic, desc: 'Speech-to-text, subtitles & caption tools' },
  { id: 'Productivity', label: 'Productivity', icon: CheckSquare, desc: 'Todo lists, habit trackers & time tools' },
  { id: 'indian-utilities', label: 'Indian Utilities', icon: MapPin, desc: 'Aadhaar, PAN, GST, IFSC & India-specific tools' },
];

export const STEPS: StepDef[] = [
  { num: '01', icon: Upload, title: 'Open a Tool', desc: 'Browse hundreds of utilities. Pick one. No sign-up needed.' },
  { num: '02', icon: Zap, title: 'Process Instantly', desc: 'Most tools run in your browser via WebAssembly. Cloud AI tools clearly marked.' },
  { num: '03', icon: Download, title: 'Download Results', desc: 'Your data never leaves your machine. Export clean, processed files.' },
];

export function getWhyChoose(toolCount: number): WhyChooseDef[] {
  return [
    { icon: Lock, title: 'Zero Data Leaving', desc: 'Local-processing tools run entirely client-side. No servers, no logs, no uploads.' },
    { icon: Zap, title: 'Edge-Accelerated', desc: 'Powered by Cloudflare Workers & WebAssembly for near-instant execution.' },
    { icon: Layers, title: `${toolCount}+ Tools`, desc: `From PDF compression to AI image generation — ${toolCount} tools and counting.` },
    { icon: Globe, title: 'Works Offline', desc: 'Many tools remain functional even without an internet connection.' },
    { icon: Palette, title: 'Beautiful by Default', desc: 'Dark & light themes. Fluid animations. Typography crafted for readability.' },
    { icon: BarChart3, title: 'Generous Free Limits', desc: 'Free tier gives you generous daily usage. Pro unlocks everything.' },
  ];
}

export const FEATURES: FeatureDef[] = [
  { icon: ShieldCheck, title: "Privacy First", desc: "Most tools never upload your files — they run locally via WebAssembly." },
  { icon: Zap, title: "Lightning Fast", desc: "Zero upload times. Processing starts the moment you select a file." },
  { icon: Server, title: "Edge Powered", desc: "Powered by Cloudflare Workers for instant load times worldwide." },
];

export const USE_CASES: UseCaseDef[] = [
  {
    title: 'For Designers',
    items: ['Remove image backgrounds instantly', 'Batch resize product photos', 'Generate AI avatars & thumbnails', 'Extract colors from any image'],
    slug: '/image',
  },
  {
    title: 'For Developers',
    items: ['Format & minify JSON/CSS/JS', 'Generate regex patterns with AI', 'Convert Markdown to HTML', 'Create fake JSON data for testing'],
    slug: '/developer',
  },
  {
    title: 'For Content Creators',
    items: ['Compress videos for social media', 'Transcribe audio to text', 'Generate blog titles with AI', 'Create branded social media posts'],
    slug: '/ai',
  },
  {
    title: 'For Business',
    items: ['Merge & split PDF contracts', 'Generate GST invoices', 'Calculate SaaS pricing', 'Create professional business cards'],
    slug: '/tools',
  },
  {
    title: 'For Students',
    items: ['Convert documents between formats for assignments', 'Generate citations & bibliographies', 'Compress images for submissions', 'Calculate GPA, loans & budgets'],
    slug: '/text',
  },
];

export function getStatsBar(toolCount: number, categoryCount: number, localTools: number) {
  const pct = Math.round((localTools / toolCount) * 100);
  return [
    { value: `${toolCount}+`, label: 'Free Tools', sub: 'And counting every week' },
    { value: `${categoryCount}`, label: 'Categories', sub: 'From PDF to AI generation' },
    { value: `${pct}%`, label: 'Client-Side', sub: `${localTools} tools, zero uploads` },
    { value: 'Free', label: 'To Start', sub: 'No credit card required' },
  ];
}

export const INDIA_TOOLS = [
  { id: 'passport', title: 'Passport Photo Maker', desc: '35×45mm, white background, ICAO compliant', slug: 'passport-photo-india' },
  { id: 'aadhaar', title: 'Aadhaar Crop & Mask', desc: 'Securely crop and mask Aadhaar numbers locally', slug: 'aadhaar-wallet-cropper' },
  { id: 'pan', title: 'PAN Card Resizer', desc: '200×200px, under 200KB for NSDL/UTIITSL', slug: 'pan-card-resizer' },
  { id: 'gst', title: 'GST Invoice Generator', desc: 'Format perfectly per GST Act 2017 rules', slug: 'gst-invoice-generator' },
];
