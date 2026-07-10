# ToolHub — Master UI/UX Design Prompt
## "Build the billion-dollar tools platform that dominates the next decade"

---

## 0. PRIME DIRECTIVE

You are building **ToolHub** — a platform that must feel like the inevitable evolution of the internet's utility layer. Not a collection of tools. A *command center*. Every design decision must answer one question: **"Does this feel like it was built by a $10B company that has been doing this for 10 years?"**

Reference benchmarks (study all of them before writing a single line of code):
- **Linear** — motion philosophy, obsessive spacing, keyboard-first
- **Vercel** — dark-mode authority, developer trust, zero clutter
- **Notion** — information density done right, mega menu elegance
- **Raycast** — command-palette UX, speed as a design value
- **Stripe** — documentation quality, trust signals, conversion science
- **Figma** — tool-centric UI, power-user affordances
- **Superhuman** — premium feel in a utility product

Your output is not a prototype. It is production code. Ship it.

---

## 1. BRAND IDENTITY & DESIGN LANGUAGE

### 1.1 Name & Voice
- Product name: **ToolHub** (or brief rebrand: consider **Toolr**, **Nexus**, **Forge**, **Apex**)
- Tagline: *"Every tool you need. Nothing you don't."*
- Voice: Confident. Terse. No filler words anywhere in the UI. Every label earns its pixel.
- Personality: A brilliant, fast engineer who also has taste. Not corporate. Not cute.

### 1.2 Typography System
- **Display font**: `Instrument Serif` or `Editorial New` or `Canela` — for hero headlines only. One serif word in an otherwise sans UI creates instant editorial authority.
- **UI font**: `Geist` (Vercel's open-source font) or `DM Sans` or `Roobert` — NOT Inter, NOT Roboto, NOT system-ui
- **Mono font**: `Geist Mono` or `JetBrains Mono` — for code snippets, file sizes, counts, badges
- **Scale**: 11px (micro labels) → 13px (secondary) → 15px (body) → 17px (primary) → 24px (section heads) → 40–72px (hero display)
- **Weight**: 400 regular, 500 medium, 600 semibold only. Never 700+ in UI elements.
- **Letter-spacing**: `-0.02em` on headings 24px+. `0.06em` on ALL CAPS micro-labels (badges, nav labels, status chips)
- **Line height**: 1.2 for display, 1.5 for UI text, 1.7 for body/descriptions

### 1.3 Color System
Primary palette — commit to ONE of these directions, do not mix:

**Option A — Midnight Authority (recommended)**
```
--bg-base:        #09090B   (zinc-950, near-black)
--bg-elevated:    #111113   (zinc-900)
--bg-overlay:     #18181B   (zinc-900)
--bg-surface:     #27272A   (zinc-800, cards)
--border-subtle:  #3F3F46   (zinc-700)
--border-default: #52525B   (zinc-600)
--text-primary:   #FAFAFA
--text-secondary: #A1A1AA
--text-muted:     #71717A
--accent:         #6366F1   (indigo-500, primary CTA)
--accent-hover:   #4F46E5   (indigo-600)
--accent-soft:    #1E1B4B   (indigo-950, badge bg)
--success:        #22C55E
--warning:        #F59E0B
--danger:         #EF4444
--india:          #FF6B35   (saffron — India cultural accent color)
```

**Option B — Clean Obsidian Light** (if going light-first)
```
--bg-base:        #FFFFFF
--bg-surface:     #F4F4F5
--bg-overlay:     #FAFAFA
--border-subtle:  #E4E4E7
--border-default: #D4D4D8
--text-primary:   #09090B
--text-secondary: #52525B
--text-muted:     #A1A1AA
--accent:         #0F172A   (ink black CTAs)
--accent-alt:     #6366F1
```

**RULE**: Every color used must be in this system. No one-off hex values anywhere.

### 1.4 Spacing Grid
- Base unit: `4px`
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
- Component padding: `12px 16px` (compact), `16px 24px` (default), `24px 32px` (spacious)
- Section vertical rhythm: `80px` between major sections on marketing pages, `48px` in app pages
- Never use arbitrary pixel values. Every spacing value must be on the 4px grid.

### 1.5 Radius Scale
```
--radius-sm:   4px    (badges, chips, inline elements)
--radius-md:   8px    (buttons, inputs, small cards)
--radius-lg:   12px   (cards, panels, dropdowns)
--radius-xl:   16px   (modals, large cards)
--radius-2xl:  24px   (hero containers, floating elements)
--radius-full: 9999px (pill buttons, avatars, tags)
```

### 1.6 Shadow System (use sparingly — only for elevation hierarchy)
```
--shadow-sm:  0 1px 2px rgba(0,0,0,0.4)
--shadow-md:  0 4px 12px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)
--shadow-lg:  0 16px 40px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)
--shadow-glow-accent: 0 0 20px rgba(99,102,241,0.25)  (ONLY on primary CTA hover)
```
Dark mode only: subtle glow on primary action buttons on hover. Never on anything else.

### 1.7 Iconography
- **Library**: Lucide Icons (primary) + Phosphor Icons (supplemental)
- **Size scale**: 14px (inline), 16px (menu items), 20px (card icons), 24px (section icons), 32px (feature icons), 48px (hero icons)
- **Style**: Consistent stroke weight `1.5px` everywhere. Never mix filled and outline in the same context.
- **Color**: Icons always inherit text color. Accent-colored icons only in CTA contexts.
- **India category**: Use custom hand-crafted icon for the 🇮🇳 India utilities section — a subtle Ashoka Chakra-inspired geometric mark. This is your cultural differentiator.

### 1.8 Motion & Animation
Every animation must have purpose. Delete decorative animations ruthlessly.

```
--duration-instant: 80ms    (state changes: active, pressed)
--duration-fast:    150ms   (hover states, tooltips appear)
--duration-default: 220ms   (panel open/close, dropdown)
--duration-slow:    350ms   (page transitions, mega menu open)
--duration-crawl:   600ms   (hero entrance, onboarding)

--ease-default:  cubic-bezier(0.16, 1, 0.3, 1)   (snappy overshoot — use everywhere)
--ease-in:       cubic-bezier(0.4, 0, 1, 1)       (elements leaving screen)
--ease-out:      cubic-bezier(0, 0, 0.2, 1)       (elements entering screen)
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1) (bouncy — use ONLY for delight moments)
```

**Required animations:**
- Mega menu: slide down + fade in, 220ms ease-out. Individual columns stagger 30ms apart.
- Search bar: expand width on focus, placeholder text dissolve
- Tool cards: `translateY(-2px)` on hover — no shadow change, just lift
- Page load: staggered fade-up for above-the-fold content, 40ms between each element
- Command palette (⌘K): instant blur-background + scale-in from center, 150ms
- CTA button: subtle scale(1.02) on hover + glow shadow
- Scroll-triggered sections: `opacity: 0 → 1` + `translateY(16px → 0)` using IntersectionObserver

**Forbidden animations:**
- Spinning loaders (use skeleton screens instead)
- Bounce on page elements that aren't being dragged
- Background animations/particles (kills performance, feels cheap)
- Any animation over 500ms that isn't a page transition

---

## 2. INFORMATION ARCHITECTURE

### 2.1 Complete Site Map

```
/ (Home)
├── /tools                    (all tools, filterable)
│   ├── /image                (image category hub)
│   │   ├── /compress
│   │   ├── /resize
│   │   ├── /background-remover
│   │   └── ... (all image tools)
│   ├── /pdf
│   ├── /text
│   ├── /audio
│   ├── /video
│   ├── /converter
│   ├── /downloader
│   ├── /transcription
│   ├── /ai                   (AI tools hub — SEPARATE section)
│   └── /india                (India utilities hub — CULTURAL ANCHOR)
├── /ai-hub                   (multi-model AI chat — premium feature)
├── /extension                (Chrome extension landing page)
├── /api                      (developer API docs)
├── /pricing
├── /blog                     (SEO content engine)
├── /changelog                (builds trust, shows velocity)
├── /about
├── /login
└── /dashboard                (authenticated user home)
    ├── /dashboard/history
    ├── /dashboard/credits
    ├── /dashboard/api-keys
    └── /dashboard/settings
```

### 2.2 Category Architecture (what lives where)

**Top-level navigation categories (7 + 1 special):**

| # | Category | Icon | Tool count | Color accent |
|---|----------|------|-----------|--------------|
| 1 | Image | photo | 21 | Purple |
| 2 | PDF | file-text | 16 | Amber |
| 3 | Text & Writing | pencil | 15 | Teal |
| 4 | Audio & Voice | microphone | 8 | Pink |
| 5 | Video | video | 11 | Blue |
| 6 | Convert & Download | arrow-left-right | 22 | Coral |
| 7 | AI Tools | cpu | 12 | Indigo (accent) |
| ★ | India Utilities | (custom) | 8 | Saffron (#FF6B35) |

**Sub-categories within AI Tools (separate from main tools):**
- AI Chat (multi-model)
- AI Image (generate, enhance, style)
- AI Writing (write, rewrite, summarize, translate)
- AI Code (generate, explain, debug)
- AI Documents (chat with PDF, OCR, summarize)
- AI Audio (transcribe, voice clone, TTS)
- AI Video (summarize, subtitle, avatar)

**India Utilities (cultural anchor — no competitor has this):**
- Passport Photo Maker (India spec)
- Aadhaar Wallet Cropper
- PAN Card Resizer
- KB Image Compressor (NSDL/UIDAI limits)
- GST Invoice Generator
- Voter ID Form Helper
- ITR Filing Prep Tools
- India ID Document Scanner

---

## 3. HEADER DESIGN

### 3.1 Header Anatomy

```
[Logo] [Nav items + mega menu trigger] [Search ⌘K] [Sign in] [Get Pro →]
```

**Exact specifications:**
- Height: `60px` desktop, `56px` mobile
- Background: `--bg-elevated` with `border-bottom: 1px solid --border-subtle`
- Backdrop blur: `backdrop-filter: blur(12px)` with 85% opacity background — header stays readable as content scrolls under it
- Position: `sticky top: 0`, `z-index: 1000`
- Max width container: `1280px` centered, `24px` horizontal padding on mobile

**Logo:**
- Wordmark only (no icon marks that need explanation)
- Two-color: brand name in `--text-primary`, a single letter or dot in `--accent` color
- Example: "Tool**Hub**" where Hub is in indigo, or a geometric mark beside wordmark
- Size: 22px font, `font-weight: 600`
- Never use a raster logo — SVG only

**Navigation items (desktop):**
- Items: `Tools ↓` · `AI Hub` · `Extension` · `Pricing` · `API`
- Font: 14px, `font-weight: 500`, `--text-secondary` default, `--text-primary` on hover
- Active state: `--text-primary` + subtle `--accent` underline 2px
- Hover: color shift in 80ms, no background change
- Chevron on "Tools" rotates 180° when mega menu opens

**Right side:**
- `⌘K` search trigger: pill shape, `background: --bg-surface`, border, keyboard shortcut hint
- `Sign in`: ghost button (text only, no border)
- `Get Pro →`: filled button, `background: --accent`, white text, with arrow that slides right 3px on hover
- Notification bell (authenticated): with red dot indicator

### 3.2 Mega Menu

**Trigger**: Hover on "Tools" nav item (desktop) OR click on mobile

**Layout: 5-column grid** inside a full-width dropdown panel

```
┌─────────────────────────────────────────────────────────────────┐
│  [Search tools...]                              [⌘K to search]  │
├───────────┬───────────┬───────────┬───────────┬─────────────────┤
│  🖼 Image  │  📄 PDF   │  ✍ Text  │  🎵 Audio │  🤖 AI Tools   │
│  ─────    │  ─────    │  ─────    │  ─────    │  ─────────      │
│  Compress │  Compress │  AI Write │  Transcrib│  AI Chat Hub    │
│  Resize   │  Merge    │  Grammar  │  Convert  │  Image Gen      │
│  BG Remove│  Split    │  Paraphras│  Cut/Trim │  PDF Chat       │
│  Upscale  │  to Word  │  Summarize│  TTS      │  Code Gen       │
│  HEIC→JPG │  to Excel │  Translate│  Noise Rmv│  Doc Summarize  │
│  → All 21 │  → All 16 │  → All 15 │  → All 8  │  → All 12      │
├───────────┼───────────┼───────────┼───────────┴─────────────────┤
│  📹 Video │ 🔄 Convert│                                          │
│  ─────    │  ─────    │  ┌──────────────────────────────────┐   │
│  Compress │  MP4→MP3  │  │  🇮🇳  India Utilities             │   │
│  to GIF   │  YT DL    │  │  Passport Photo · Aadhaar Crop   │   │
│  Trim     │  TikTok   │  │  PAN Resize · KB Compressor      │   │
│  Subtitle │  QR Code  │  │  GST Invoice · Voter ID          │   │
│  → All 11 │  → All 22 │  └──────────────────────────────────┘   │
└───────────┴───────────┴───────────────────────────────────────  ─┘
│  🔥 Most used today: BG Remover · PDF Compress · YT Download    │
└─────────────────────────────────────────────────────────────────┘
```

**Mega menu specifications:**
- Opens on hover with 100ms delay (prevents accidental triggers)
- Full viewport width, `max-width: 1280px`, centered
- Background: `--bg-elevated` + `border: 1px solid --border-subtle`
- `border-radius: 0 0 16px 16px` (square top, rounded bottom)
- Animation: `translateY(-8px) → 0` + `opacity: 0 → 1`, 220ms ease-out
- Column stagger: each column fades in 30ms after previous
- Each category column: 180px wide, category header in `--text-muted` 11px ALL CAPS + `letter-spacing: 0.08em`
- Tool links: 14px, `--text-secondary`, hover `--text-primary` + `--accent` left border 2px, `padding-left: 8px`
- "→ All X tools" footer link: `--accent` color, underline on hover
- India section: full-width row at bottom, `background: linear-gradient(90deg, rgba(255,107,53,0.08), transparent)` — saffron tint
- "Most used today" ticker: real-time data from CF Analytics, updates every 60s
- Keyboard: `Escape` closes, arrow keys navigate, `Enter` to select

**Mobile mega menu** (hamburger → full-screen drawer):
- Slides in from left, full height
- Accordion-style: tap category to expand tools list
- Search bar pinned to top of drawer
- "India Utilities" section with saffron accent always visible without expanding
- Bottom of drawer: `Sign in` + `Get Pro` CTAs

### 3.3 Search (⌘K Command Palette)
This is your most powerful retention feature. Users who use search stay 3× longer.

**Behavior:**
- `⌘K` or `Ctrl+K` on any page opens command palette
- Also triggered by clicking the search pill in header
- Instant fuzzy search across all 200+ tools
- Shows recent tools (last 5 used, stored in localStorage)
- Shows popular tools (top 10 by this-week traffic from CF Analytics)
- Shows AI-powered suggestion: "Based on your history, try: PDF OCR"
- Results grouped: `Tools`, `Recent`, `AI Features`, `Docs`
- Keyboard navigation: arrow keys, Enter, Escape
- Each result shows: tool icon, tool name, category chip, keyboard shortcut if any

**Design:**
- Modal center of screen, `max-width: 600px`
- Blurred backdrop: `backdrop-filter: blur(8px)` + dark overlay
- Input: `font-size: 18px`, no border, no background — just text on the panel
- Results: `48px` row height, icon left, name + category, no bullet points
- Highlighted match characters in `--accent` color
- Footer: "↑↓ navigate · Enter select · Esc close" in micro text

---

## 4. HOME PAGE DESIGN

### 4.1 Hero Section

**Layout:** Left-aligned headline, right side has animated tool showcase (NOT an illustration — actual working mini-tool embed)

**Headline copywriting formula:**
```
[Powerful verb] [what users want] [without the thing they hate]

Examples:
"Every tool you need, zero installs required."
"200+ professional tools. Free forever, fast always."
"The last tools site you'll ever need."
```

**Hero specifications:**
- Headline: 56–72px, display serif font (one word in serif for editorial drama), bold
- Subheadline: 18px, `--text-secondary`, max 2 lines, describes the value proposition
- Primary CTA: "Start for free →" — large pill button, accent color, 48px height
- Secondary CTA: "See all tools" — ghost button
- Below CTAs: Social proof line: "Join 250,000+ users from Infosys, TCS, IIT Delhi, Razorpay..."
- Trust badges row: "🔒 No signup needed" · "⚡ Client-side processing" · "🇮🇳 Built for India" · "✓ Used by 2M people/month"

**Right side hero widget — live tool preview:**
- Embed actual working "Image Compressor" or "PDF Compressor" as a mini widget
- User can drag & drop a file and see it work in real-time — RIGHT on the home page
- This is your #1 conversion driver: demonstrate value before asking for anything
- Label: "Try it now — no signup" in small text below

### 4.2 Category Grid (below hero)

**"Most popular" section** — not a boring grid. Use a split-layout:

Left column (40%): Large featured card showing the #1 trending tool today with live stats
Right columns (60%): 2×3 grid of popular tool tiles

Each tool tile:
- `160px × 180px` card
- Category color dot top-left
- Tool icon center (32px Lucide icon)
- Tool name (14px, semibold)
- One-line description (12px, muted)
- "Free" or "Pro" badge top-right
- Hover: card lifts 2px, background shifts slightly warmer/lighter, a subtle "Open →" appears

**Section title design:** NOT "Popular Tools" — instead:
```
[eyebrow: "USED 2M TIMES THIS MONTH"]
Most powerful tools,
zero compromise.
```

### 4.3 Categories Strip
Full-width horizontal scroll on mobile, 8-column grid on desktop.

Each category chip:
- `120px × 80px` rounded card
- Category icon (24px)
- Category name (13px)
- Tool count in muted text ("21 tools")
- On hover: accent color background tint matching category color

Order: Image → PDF → AI Tools (boosted, special treatment) → Video → Text → Audio → Convert → India ★

**AI Tools category gets special treatment:**
- Slightly larger card (`140px × 90px`)
- Animated gradient border (subtle, cycling)
- "NEW" badge
- Description: "Powered by Claude & GPT-4o"

### 4.4 "AI Tools" Feature Section

Dedicated full-width section with dark background (even on light-theme site):
```
background: --bg-base (darkest)
```

3-column feature grid:
1. **AI Chat Hub** — "Talk to Claude, GPT-4o, and Gemini in one place"
2. **Document Intelligence** — "Upload any PDF. Ask anything about it."
3. **AI Image Suite** — "Generate, enhance, remove backgrounds — all AI-powered"

Each column: large icon, headline, 2-line description, "Try free →" link

### 4.5 India Section (Cultural Anchor)

Full-width section with saffron-to-transparent gradient strip at top:

**Headline:** "Built for Bharat 🇮🇳"
**Subheadline:** "The only tools platform that speaks your government's language."

Grid of India-specific tools — each with the exact specification it targets:
- Passport Photo: "35×45mm, white background, ICAO compliant"
- Aadhaar Photo: "Under 200KB, JPEG, as per UIDAI guidelines"
- PAN Application: "3.5×2.5cm, 200×200px, NSDL format"
- GST Invoice: "GST Act 2017 compliant, auto-GSTIN validation"

**This section appears ONLY to Indian IP addresses (CF Geolocation header) — everyone else sees a "Global Tools" section instead.** This is a billion-dollar UX insight: geo-personalization.

### 4.6 Trust & Social Proof Section

**Stats row:** 4 animated counters that count up when scrolled into view
```
200+         2M+          150+         99.9%
Tools        Monthly Users Countries    Uptime
```

**Logo strip:** Company logos of users (Infosys, Razorpay, Zepto, BYJU'S, Nykaa, Swiggy for India users; generic tech companies for global users)

**Testimonials:** 3 cards, each with:
- User avatar (real photo or initials)
- Star rating (always 5 stars — only show verified positive reviews)
- Quote (max 2 sentences)
- Name, title, company
- Which tool they use most

### 4.7 Pricing Preview Section
Tease the pricing — don't hide it.

3-tier preview: Free · Pro (₹199/mo) · Team (₹499/mo)

**Key conversion technique:** Show the exact number of "free uses remaining today" dynamically:
"You have 8 free uses remaining today. Pro users get unlimited."
This creates urgency without being annoying.

### 4.8 Footer Design

**4-column footer grid:**

Column 1 — Brand:
- Logo + tagline
- One-sentence mission
- Social links (Twitter/X, GitHub, LinkedIn, YouTube)
- "Made with ❤️ in India 🇮🇳" — cultural trust signal

Column 2 — Tools:
- Image Tools
- PDF Tools  
- AI Tools
- Video Tools
- Audio Tools
- Converters
- Downloaders
- India Utilities

Column 3 — Product:
- Pricing
- Chrome Extension
- API / Developers
- Changelog
- What's New
- Roadmap (public — builds trust)
- Status page (uptime)

Column 4 — Company:
- About
- Blog
- Careers ("We're hiring →")
- Privacy Policy
- Terms of Service
- Contact
- Advertise

**Footer bottom bar:**
- Copyright
- "All processing happens in your browser — your files never leave your device"
- Language selector (EN · हिंदी · தமிழ் · తెలుగు · বাংলা)
- Theme toggle (light/dark)

**Footer design:**
- Background: `--bg-elevated` (slightly lighter than page bg)
- Top border: `1px solid --border-subtle`
- Link hover: `--accent` color, no underline by default
- Section headers: 11px ALL CAPS, `--text-muted`, `letter-spacing: 0.1em`
- No decorative elements — clean, information-dense, trustworthy

---

## 5. INDIVIDUAL TOOL PAGE DESIGN

Every tool page follows the same layout. Consistency = trust.

### 5.1 Tool Page Anatomy

```
[Breadcrumb: Home > Image Tools > Image Compressor]
[Tool name H1] [Category badge] [Usage count "2.3M uses this month"]

[TOOL WIDGET — full width, prominent, above fold]

[How it works — 3 steps]
[Related tools — horizontal scroll]
[FAQ — SEO content]
[User reviews]
```

### 5.2 Tool Widget Design

The tool widget IS the page. Everything else supports it.

**Widget container:**
- `background: --bg-elevated`
- `border: 1px solid --border-default`
- `border-radius: 16px`
- `padding: 32px`
- Max width: `760px`, centered

**Drop zone:**
- Large dashed border, rounds to solid on drag-over
- Icon + "Drop files here or click to browse" 
- Accepted formats list below: "JPG, PNG, WEBP, GIF (max 50MB)"
- On file select: smooth progress → instant result
- Result section: before/after comparison (split slider for image tools), download button prominent

**CTA hierarchy:**
1. Primary: "Download" — accent fill button, large, with file size saved (e.g. "Download (saved 67%)")
2. Secondary: "Process another file" — ghost button
3. Tertiary: "Share result" — icon button

**Freemium gates:**
- Free: 5 uses per day, max 5MB file, no batch
- Show "Pro" lock icon on premium features — NOT a hard block, a gentle upgrade prompt
- "You've used 4 of 5 free conversions today. [Upgrade for unlimited →]"

### 5.3 Tool Page SEO Content (below the tool)

**"How to [tool action]" section** — 3-step visual guide:
```
Step 1: Upload        Step 2: Configure     Step 3: Download
[icon]                [icon]                [icon]
Drop your file here   Choose settings       Get your result
```

**"Why use ToolHub" trust section:**
- ⚡ Instant (client-side, no upload wait)
- 🔒 Private (files never leave your browser)
- 🆓 Free forever (basic tier)
- 📱 Mobile-friendly

**Related tools** — horizontal scroll of 6–8 similar tools. Label: "You might also need..."

**FAQ section** — 5 questions targeting long-tail SEO keywords:
- "Is [tool] free?"
- "How do I [task] on iPhone/Android?"
- "What's the maximum file size?"
- "Is my file safe/private?"
- "[Tool] vs [competitor tool] — which is better?"

---

## 6. TOOL LISTING / DISCOVERY PAGE (`/tools`)

### 6.1 Layout

**Left sidebar (240px, sticky):**
```
[Search tools]
─────────────
CATEGORIES
○ All tools (200+)
○ Image (21)
○ PDF (16)
○ AI Tools (12) ★ NEW
○ Text (15)
○ Video (11)
○ Audio (8)
○ Convert (12)
○ Download (10)
○ India (8) 🇮🇳
─────────────
FILTER BY
○ Free only
○ Client-side only
○ No signup needed
○ AI-powered
─────────────
SORT BY
○ Most popular
○ Newest
○ A–Z
```

**Main content:**
- `3-column grid` on desktop, `2-column` on tablet, `1-column` on mobile
- Tool cards: `240px × 140px` — icon, name, description, badge, usage count
- Above grid: active filter chips, tool count "Showing 21 Image tools"
- Infinite scroll with skeleton loading (NOT pagination — never paginate a tools directory)

**Top of page:** "Trending right now" horizontal scroll of 6 tools with animated "🔥 hot" indicators

### 6.2 Tool Card Design

```
┌───────────────────────────────┐
│  [category color dot]  [badge]│
│                               │
│  [icon 32px]                  │
│                               │
│  Tool Name                    │
│  One line description here    │
│                               │
│  ████████████░░  2.1M uses    │
└───────────────────────────────┘
```

- Category color left border (2px solid)
- Icon in matching category color tint background circle
- Name: 15px, weight 500
- Description: 13px, muted, max 1 line, truncate
- Usage bar: thin progress bar showing relative popularity within category
- Badges: "FREE" (green) · "PRO" (accent) · "AI" (purple) · "NEW" (amber) · "🇮🇳 India" (saffron)
- Hover state: lift, show "Open tool →" overlay, cursor pointer
- No click required — hovering shows a mini preview of the tool interface in a tooltip (for power users)

---

## 7. DASHBOARD (AUTHENTICATED USERS)

### 7.1 Dashboard Layout

**Sidebar nav (64px collapsed / 240px expanded):**
- Home icon (dashboard overview)
- History (recent files)
- Favorites (starred tools)
- Credits (usage meter)
- API Keys
- Settings
- Help
- Upgrade CTA (bottom, pinned)

**Main content area:**

Row 1 — Greeting + stats:
```
Good morning, Arjun ☀️                    [Credits: 847 remaining]
Your usage this week: 23 tools used · 1.2GB processed · 4.2 hrs saved
```

Row 2 — Quick access (8 most-used tools, personalized):
Horizontal strip of tool cards, "Your tools" heading

Row 3 — Recent files:
List of last 10 processed files with: filename, tool used, date, file size, re-process button, download again button

Row 4 — "Discover" section:
Tools the user hasn't tried yet, ranked by similarity to their usage patterns

### 7.2 Credits System Display

Visual credits meter:
```
Monthly Credits
████████████░░░░░  720 / 1000 used

[Free plan]  Upgrade to Pro for unlimited →

Tool costs:
• Image compress: 1 credit
• PDF to Word: 5 credits  
• AI tools: 10–20 credits
• Downloaders: 2 credits
```

---

## 8. AI HUB PAGE (`/ai-hub`)

This is your premium flagship — treat it like its own product.

**Hero:** Full-dark section, "Talk to any AI. Do anything." headline
**Model switcher:** Tabs for Claude · GPT-4o · Gemini · Llama 3 (CF Workers AI, free)

**Chat interface:**
- Left sidebar: conversation history, new chat button
- Main: standard chat UI but with tool integrations
- Above input: `@mention` tool integrations — type `@pdf` to attach PDF for analysis, `@image` to process image, `@web` to search
- Slash commands: `/summarize`, `/translate`, `/rewrite`, `/code`
- Model badge always visible showing current model + cost per message

**Killer feature — Tool Actions in Chat:**
User types "compress this image" → AI detects intent → shows inline tool widget in chat → user processes file without leaving the conversation.

This is the moat. No competitor does this.

---

## 9. PERFORMANCE REQUIREMENTS

These are non-negotiable. Performance IS the product.

### 9.1 Core Web Vitals Targets
```
LCP (Largest Contentful Paint):  < 1.2s
FID (First Input Delay):         < 50ms
CLS (Cumulative Layout Shift):   < 0.05
INP (Interaction to Next Paint): < 100ms
TTFB (Time to First Byte):       < 200ms (CF edge cache)
```

### 9.2 Technical Requirements
- **Next.js 14 App Router** with React Server Components
- **Cloudflare Pages** deployment — automatic edge distribution to 300+ PoPs
- **Cloudflare Workers** for all backend logic
- Every tool page is **statically generated** at build time (ISR for dynamic data)
- Images: all served as WebP/AVIF via `next/image` with blur placeholder
- Fonts: self-hosted (no Google Fonts — GDPR + performance)
- Bundle: < 100KB initial JS, code-split per tool
- **Client-side processing ONLY** for all file tools — files never touch a server
- Service Worker for offline capability on tool pages
- No third-party scripts on tool pages (no GTM, no tracking — add CF Web Analytics only)

### 9.3 SEO Technical Requirements
- Every tool page: unique `<title>`, `<meta description>`, `<h1>`, structured data (HowTo + SoftwareApplication schema)
- `sitemap.xml` auto-generated for all 200+ tool pages
- `robots.txt` allowing all crawlers
- OpenGraph + Twitter Card meta for every tool (for social sharing)
- URL structure: `/[category]/[tool-slug]` — clean, no trailing slashes
- Canonical URLs on all pages
- `hreflang` tags for Indian language versions (hi, ta, te, bn)
- `JSON-LD` on every tool page:
  ```json
  {
    "@type": "SoftwareApplication",
    "name": "Image Compressor",
    "applicationCategory": "UtilitiesApplication", 
    "offers": { "@type": "Offer", "price": "0" }
  }
  ```

---

## 10. MONETIZATION UX (how money flows through the UI)

### 10.1 Freemium Gate Design Principles
- **Show value first, ask for upgrade second** — never block access before demonstration
- The upgrade prompt appears AFTER the tool delivers its result ("That was great, right? Here's what Pro unlocks...")
- Free tier limits are shown as "you have X left today" — not "you've hit your limit"
- Pro features have a ✦ symbol (not a lock icon — lock feels punishing, ✦ feels aspirational)

### 10.2 Upgrade Prompt Hierarchy
1. **Passive**: Credit meter in header always visible
2. **Contextual**: After 3rd use of a tool: "You've used this 3 times. Heavy user? Pro is ₹199/mo."
3. **Feature gate**: Click a Pro feature → modal with specific benefit highlighted ("Batch processing up to 500 files at once")
4. **Exit intent**: On leaving a tool page: "Before you go — did you know Pro users get unlimited uses?"

### 10.3 Pricing Page Design
- 3 tiers: **Free** · **Pro ₹199/mo** · **Team ₹499/mo**
- Annual toggle (saves 40%): large, prominent, with "Most popular" badge on annual Pro
- Feature comparison: grouped by category (not a wall of checkboxes)
- "Start free" is the primary CTA even on the pricing page — remove friction
- Show Razorpay payment as first option for Indian users (detected via IP), Stripe as fallback
- "30-day money-back guarantee" badge — reduces purchase anxiety
- FAQ section specifically about billing and cancellation

---

## 11. LOCALIZATION & INDIA-FIRST DESIGN

### 11.1 Indian User Experience
- **Language toggle** in header: EN · हि · த · తె · বা (top 5 by internet population)
- **Currency**: Show ₹ pricing by default for India IPs (not $)
- **Payment methods**: Razorpay, UPI, PhonePe, Paytm, NetBanking — not just cards
- **Indian phone number format** in forms: +91 prefix auto-populated
- **India-specific landing pages**: `/tools/india` with saffron color treatment
- **Localized SEO**: Hindi keyword pages ("इमेज कम्प्रेस करें"), Tamil pages, etc.

### 11.2 Geolocation Personalization
Using Cloudflare's `CF-IPCountry` header:

**For India visitors:**
- Show India Utilities section in mega menu (position 2, high visibility)
- Show ₹ pricing everywhere
- Show Razorpay/UPI as payment default
- Show "Made in India" trust badge in footer
- Show India-specific testimonials
- Show Diwali/IPL/exam season-relevant tool promotions (seasonal)

**For non-India visitors:**
- Show global tools, $ pricing, Stripe payment
- Hide India Utilities from primary navigation (still accessible via /tools/india)

---

## 12. ACCESSIBILITY REQUIREMENTS (non-negotiable)

- **WCAG 2.1 AA** compliance minimum, target AAA for core flows
- All interactive elements keyboard-navigable
- `Tab` order follows visual reading order
- Focus rings: `outline: 2px solid --accent, outline-offset: 2px` — always visible, never hidden with `outline: none`
- All images: meaningful `alt` text, decorative images `alt=""`
- Color contrast: minimum 4.5:1 for body text, 3:1 for large text
- Screen reader support: `aria-label` on icon-only buttons, `aria-live` on dynamic content (file processing status)
- Skip navigation link: visually hidden, becomes visible on focus: "Skip to main content"
- Reduced motion: `@media (prefers-reduced-motion: reduce)` — disable all animations, keep functionality
- File inputs: always keyboard accessible, not replaced by styled divs that block accessibility
- Error messages: not color alone — always icon + text + ARIA role="alert"

---

## 13. COMPONENT SPECIFICATIONS (to implement)

### 13.1 Button System
```
Primary:   filled accent, white text, radius-full pill, 44px height
Secondary: outlined, accent border, accent text, same dimensions  
Ghost:     text only, no border, muted text → primary on hover
Danger:    filled red, white text
Icon:      square/circle, 36px, ghost treatment
Size modifiers: sm (32px), md (44px, default), lg (52px)
```

### 13.2 Badge/Chip System
```
FREE:   green bg, green text, radius-sm, 11px mono font
PRO:    accent bg (10% opacity), accent text, ✦ prefix
NEW:    amber bg, amber text, pulsing dot
AI:     purple bg, purple text, ⚡ prefix
🇮🇳:    saffron bg, dark text
HOT:    red bg, red text, animated flame
```

### 13.3 Input System
```
Default:     bg-surface, border-default, radius-md, 40px height
Focus:       border-accent, ring: 0 0 0 3px rgba(accent, 0.15)
Error:       border-danger, ring-danger
Success:     border-success, right checkmark icon
Disabled:    bg-overlay, muted text, cursor-not-allowed
Search:      + left search icon, right clear button (×)
File input:  hidden, replaced by styled drop zone
```

### 13.4 Loading States
```
Skeleton:    animated shimmer on bg-surface, exact shape of content
Progress:    thin line at top of tool widget, accent color, smooth
Spinner:     ONLY in button (12px, inline), never full-page
Processing:  "Compressing... 67%" with actual progress value from FFmpeg WASM
Success:     green checkmark animation (spring ease), auto-dismisses 3s
Error:       red × with message, retry button
```

---

## 14. WHAT MAKES THIS FEEL LIKE A BILLION-DOLLAR PRODUCT

These are the nuances that separate good from unforgettable:

1. **Every number is live** — tool usage counts update in real-time (CF KV store, updated every 5min)
2. **Keyboard first** — every action has a shortcut. Show them in tooltips (⌘+Enter to process)
3. **Zero dead ends** — every error message has a clear next action
4. **Micro-copy excellence** — button text is never "Submit." It's "Compress image →" or "Generate PDF"
5. **The 3-second test** — a new visitor must understand what the site does within 3 seconds
6. **Progressive disclosure** — advanced settings hidden by default, revealed by "Advanced options ↓"
7. **Undo everywhere** — any destructive action (delete file, clear history) is undoable for 5 seconds
8. **Delight moments** — confetti on first Pro upgrade, personalized greeting on dashboard, tool completion sound (subtle, optional)
9. **Changelog page** — public roadmap + shipped features. Updated weekly. Builds trust, reduces churn.
10. **Status page** — `status.toolhub.app` showing real-time uptime for all services
11. **"Last updated"** timestamp on every tool page — shows the product is alive and maintained
12. **File naming intelligence** — downloaded files are named logically: `compressed_filename_67pct.jpg` not `output.jpg`
13. **India-first marketing** — all marketing copy, pricing, case studies, and testimonials should have Indian companies/people prominently featured
14. **Speed theater** — show processing time: "Compressed in 0.3s" — makes users feel they got something fast and premium
15. **Empty state excellence** — dashboard with no history: not blank, but "You haven't used any tools yet. Start with our most popular: [3 tools]"

---

## 15. TECH STACK IMPLEMENTATION NOTES (for the developer reading this)

```
Framework:       Next.js 14 (App Router + React Server Components)
Hosting:         Cloudflare Pages
Backend:         Cloudflare Workers (TypeScript)
Database:        Cloudflare D1 (users, credits, history)
Cache/KV:        Cloudflare KV (sessions, rate limits, live counters)
Object Storage:  Cloudflare R2 (temp file storage if needed)
AI Backend:      Cloudflare Workers AI (free: Llama3, Whisper, FLUX)
Premium AI:      Claude claude-sonnet-4-20250514 API + OpenAI GPT-4o (via CF Worker)
Auth:            Clerk (free up to 10k MAU)
Payments:        Razorpay (India) + Stripe (global)
Analytics:       Cloudflare Web Analytics (privacy-first, free)
Product:         PostHog (feature flags, funnels, session recording)
Error tracking:  Sentry (free tier)
CDN/Media:       Cloudflare Images (auto-optimize, auto-WebP)
Search:          Cloudflare Vectorize (semantic tool search)
Email:           Resend (transactional email, free tier)
Monitoring:      Cloudflare Workers Observability
```

---

## 16. LAUNCH SEQUENCE (to reach 250K monthly users)

1. **Week 1–2**: Ship Phase 1 tools + this design system
2. **Week 3**: Submit to ProductHunt (Tuesday 12:01 AM PST)
3. **Week 4**: Post to Reddit r/InternetIsBeautiful, r/india, r/webdev
4. **Month 2**: Outreach to 50 Indian YouTubers covering productivity tools
5. **Month 3**: SEO content blitz — 100 long-form "how to" articles
6. **Month 4**: Chrome Extension launch on Chrome Web Store
7. **Month 6**: Announce API program for developers
8. **Month 8**: B2B outreach to Indian startups (Razorpay, Zepto tier companies)

---

*End of master prompt. This document is the single source of truth for every UI/UX and design decision on ToolHub. No exceptions without updating this document first.*
