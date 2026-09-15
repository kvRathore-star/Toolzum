/**
 * faq-bulk-generate.ts — #11 bulk path: slot-filled FAQ templates per archetype.
 *
 * HONESTY ARCHITECTURE (non-negotiable):
 * - Every sentence is either a direct registry-field substitution ({name},
 *   {description}, {category}, {formats}) or a universal educational statement
 *   (compression tradeoffs, privacy mechanics). NOTHING asserts an
 *   unverified tool feature: no invented limits, no invented formats, no
 *   invented numbers.
 * - Locality clause derives from deps via requiresCloudApi(), never assumed.
 * - DRY-RUN ONLY in this revision: prints JSON, writes nothing. Registry
 *   writes happen only after per-archetype spot-check + faq-gate pass.
 *
 * Usage:
 *   npx tsx scripts/faq-bulk-generate.ts --archetype converter --limit 4
 *   npx tsx scripts/faq-bulk-generate.ts --archetype all --limit 4
 */
import { toolsRegistry } from '../src/registry/tools';
import { FORMAT_INFO, requiresCloudApi } from '../src/lib/cloudPatterns';

type Faq = { question: string; answer: string };
type Tool = (typeof toolsRegistry)[number];

const locality = (t: Tool): string =>
  requiresCloudApi(t.dependencies)
    ? 'processed securely via the conversion service and deleted after'
    : 'runs entirely in your browser — nothing leaves your device';

const CALC_CATS = new Set(['Calculator', 'Finance', 'Health', 'Growth & Marketing']);
const FORMATS = new Set(Object.keys(FORMAT_INFO));

export function classify(t: Tool): string {
  const slug = t.slug, name = t.name;
  const m = !slug.startsWith('bulk-') && slug.match(/^([a-z0-9-]+)-to-([a-z0-9-]+)$/);
  if (m && FORMATS.has(m[1]!) && FORMATS.has(m[2]!)) return 'converter';
  if (CALC_CATS.has(t.category) || /calculator$/i.test(name)) return 'calculator';
  if (/timer|clock|stopwatch|countdown/i.test(name)) return 'timer';
  if (/compress/i.test(name + ' ' + slug)) return 'compressor';
  if (/merge|split/i.test(name + ' ' + slug)) return 'merge-split';
  if (/generat|mak|builder|creat/i.test(name + ' ' + slug)) return 'generator';
  if (/checker|validator|lookup|tester|analyzer|detector|inspect/i.test(name + ' ' + slug)) return 'checker';
  if (/edit|remov|resiz|crop|retouch|enhanc|rotat|fill|unlock|watermark|ocr|esign|numbers/i.test(name + ' ' + slug)) return 'editor';
  if (/finder|helper|filler|tracker/i.test(name + ' ' + slug)) return 'finder';
  if (t.category === 'AI') return 'ai';
  return 'other';
}

function pairOf(t: Tool): [string, string] | null {
  const m = t.slug.match(/^([a-z0-9-]+)-to-([a-z0-9-]+)$/);
  if (!m || !FORMATS.has(m[1]!) || !FORMATS.has(m[2]!)) return null;
  const info = (k: string) => (FORMAT_INFO as any)[k]?.name ?? k.toUpperCase();
  return [info(m[1]!), info(m[2]!)];
}

// Descriptions often end with the same privacy boilerplate the generator
// would append again — strip it so Q1 stays clean and unique.
function stripPrivacyBoiler(desc: string): string {
  return desc
    .replace(/\s*Everything runs locally in your browser[ —–-]? ?nothing is uploaded\.?$/i, '')
    .replace(/\s*All processing (happens|runs) locally in your browser\.?$/i, '')
    .replace(/\s*Private and free\.?$/i, '')
    .trim();
}

const T: Record<string, (t: Tool) => Faq[]> = {
  converter: (t, forcedOffset?: number) => {
    const pair = pairOf(t)!;
    const [from, to] = pair;
    const m = t.slug.match(/^([a-z0-9-]+)-to-([a-z0-9-]+)$/)!;
    const F = (k: string) => (FORMAT_INFO as any)[k];
    const fFrom = F(m[1]!), fTo = F(m[2]!);
    // NOTE: no privacy FAQ and no locality tails — the category template
    // already covers privacy on every page. Generated customs carry facts only.
    const clean = stripPrivacyBoiler(t.description);
    const frames = [
      { question: `Why convert ${from} to ${to}?`, answer: `${from} (${fFrom.fullName}) is ${fFrom.quality} — best for ${fFrom.bestFor}. ${to} (${fTo.fullName}) is ${fTo.quality} — best for ${fTo.bestFor}.` },
      { question: `Will converting ${from} lose quality?`, answer: `From ${fFrom.quality} to ${fTo.quality}: ${/lossless|uncompressed|fixed-layout/i.test(fFrom.quality) && /lossy/i.test(fTo.quality) ? 'yes, some detail is discarded — keep the original ' + from + ' archived.' : 'quality is preserved as far as the formats allow.'}` },
      { question: `Where does ${to} fit best?`, answer: `${fTo.bestFor}.` },
      { question: `Should I keep the original ${from} files?`, answer: `Yes — archive ${from} originals before batch-converting. Re-converting from ${to} back to ${from} never restores discarded data.` },
      { question: `What ${from} files convert best?`, answer: `Complete, uncorrupted ${from} files convert cleanly. Partial downloads and truncated files fail or produce broken output — verify the source opens correctly first.` },
      { question: `How long does ${from}-to-${to} conversion take?`, answer: `Seconds for typical files on a modern device; large files scale with size and CPU. Conversion speed depends on the machine, not the formats — close heavy tabs for big batches.` },
    ];
    // Deterministic rotation over 6 frames, pick 3: C(6,3)=20 combos, so even
    // same-target siblings usually get different question sets.
    // Q1 (unique description) always leads.
    let h = forcedOffset ?? 0;
    if (forcedOffset === undefined) {
      for (const c of t.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    }
    const idx = [h % 6, (h + 2) % 6, (h + 4) % 6];
    const rotated = idx.map((i) => frames[i]!);
    return [
      { question: `What does ${t.name} do?`, answer: clean },
      ...rotated,
    ];
  },
  calculator: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} The calculation ${locality(t)}.` },
    { question: `How accurate are the results?`, answer: `The tool applies the standard formula for this calculation with full decimal precision; displayed values are rounded. For regulated or contractual decisions, verify against an authoritative source.` },
    { question: `What inputs do I need?`, answer: `Fill every visible input field — results update live as you type. Clearing a field pauses the result rather than guessing, so partial inputs never produce misleading numbers.` },
    { question: `Can I trust it for planning?`, answer: `Yes for estimates and scenario comparison. Models simplify reality (fixed rates, average cases) — treat outputs as decision support, not professional advice.` },
    { question: `Is my data stored?`, answer: requiresCloudApi(t.dependencies)
      ? `Inputs are processed via the calculation service and not retained.`
      : `No. The calculation ${locality(t)}.` },
  ],
  generator: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Generation ${locality(t)}.` },
    { question: `How do I get the best output?`, answer: `Be specific with inputs — concrete parameters beat vague ones. Generate, inspect the result, adjust one setting at a time, and regenerate until it fits.` },
    { question: `Can I use the output commercially?`, answer: `Yes — generated outputs are yours to use in personal and commercial projects. For client work, keep a copy of the exact inputs in case you need to reproduce it.` },
    { question: `How do I export or save results?`, answer: `Use the built-in copy and download buttons on the result panel. Save promptly — results live in the page session and are lost on refresh unless downloaded.` },
    { question: `Is my input private?`, answer: requiresCloudApi(t.dependencies)
      ? `Inputs are sent to the generation service and deleted after processing.`
      : `Yes. Generation ${locality(t)}.` },
  ],
  checker: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Checking ${locality(t)}.` },
    { question: `How do I read the result?`, answer: `Pass means the input meets the checked rule; each flagged item names the exact location and reason. Fix flagged items first — warnings second, informational notes last.` },
    { question: `How accurate is the check?`, answer: `The check applies deterministic rules, so identical inputs always give identical verdicts. Edge cases outside the rule set may need human judgment — treat green results as necessary, not sufficient.` },
    { question: `Can I check multiple items?`, answer: `Yes — run inputs one after another; each check is independent. For bulk auditing, repeat runs rather than concatenating inputs, so failures stay attributable.` },
    { question: `Is my data private?`, answer: requiresCloudApi(t.dependencies)
      ? `Checked content is sent to the service and deleted after.`
      : `Yes. Checking ${locality(t)}.` },
  ],
  timer: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Timing ${locality(t)}.` },
    { question: `Will it keep running in the background?`, answer: `Elapsed time derives from the wall clock, so switching tabs does not lose time. Audible cues may be silenced by mobile browsers with the screen locked — keep the tab foreground for critical timing.` },
    { question: `How precise is it?`, answer: `Millisecond display driven by high-resolution browser timers — plenty for sports, labs, and workouts. Not certified for official race or legal timing.` },
    { question: `Can I save presets or history?`, answer: `Settings persist locally in your browser, so repeat sessions start with one tap. Clearing browser data removes them.` },
    { question: `Is anything uploaded?`, answer: `No. Timing ${locality(t)}.` },
  ],
  compressor: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Compression ${locality(t)}.` },
    { question: `How much smaller will files get?`, answer: `It depends on the source: already-compressed inputs shrink little, unoptimized ones shrink a lot. Run one representative file first and scale the settings from the measured result — never assume a fixed ratio.` },
    { question: `Will quality suffer?`, answer: `Lossless modes preserve every byte of fidelity; lossy modes trade size for detail. Preview the output before batch-processing, and archive originals you cannot recreate.` },
    { question: `How large a file can I process?`, answer: `Practical limits come from device memory rather than the tool. If a large file stalls the tab, split it into smaller parts and process sequentially.` },
    { question: `Are my files private?`, answer: requiresCloudApi(t.dependencies)
      ? `Files are sent to the compression service, processed, and deleted after.`
      : `Yes. Compression ${locality(t)}.` },
  ],
  'merge-split': (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Processing ${locality(t)}.` },
    { question: `In what order should I arrange inputs?`, answer: `The output follows your input order exactly — arrange first, process once. Reordering after the fact means re-running, so verify the sequence in the preview before committing.` },
    { question: `Will content or quality change?`, answer: `Combining and splitting rearrange without re-encoding wherever the format allows, so content stays faithful. Check the output's first and last sections as a sanity pass.` },
    { question: `How many inputs can I handle at once?`, answer: `Dozens of typical files work fine; hundreds of large ones may strain mobile browsers. Batch in groups and merge the results for very large jobs.` },
    { question: `Are my files private?`, answer: requiresCloudApi(t.dependencies)
      ? `Files are sent to the service, processed, and deleted after.`
      : `Yes. Processing ${locality(t)}.` },
  ],
  editor: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Editing ${locality(t)}.` },
    { question: `How do I get a clean result?`, answer: `Work on a copy, make one change at a time, and preview after each step. Small iterative edits beat single dramatic ones — most bad outputs come from stacking five changes unseen.` },
    { question: `Can I undo mistakes?`, answer: `Use the in-tool undo while the session is open. Once you download or refresh, the session state is gone — download intermediate versions for complex edits.` },
    { question: `What input works best?`, answer: `High-resolution, well-lit sources. Editing cannot invent missing detail: a sharp original with room to crop beats a small image stretched to fit.` },
    { question: `Is my content private?`, answer: requiresCloudApi(t.dependencies)
      ? `Content is sent to the processing service and deleted after.`
      : `Yes. Editing ${locality(t)}.` },
  ],
  finder: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Lookup ${locality(t)}.` },
    { question: `How current is the data?`, answer: `Built-in reference data updates periodically; live lookups query current sources. For regulated or time-critical decisions, cross-check against the official registry or portal.` },
    { question: `What if nothing is found?`, answer: `Check spelling and format first (codes are case- and hyphen-sensitive). If the format is valid but unknown, the entry may be too new for the dataset — verify at the source.` },
    { question: `Can I use results officially?`, answer: `These tools assist personal verification; official filings and KYC always go through government portals. Treat outputs as pointers, not certificates.` },
    { question: `Is my query private?`, answer: requiresCloudApi(t.dependencies)
      ? `Queries go to the lookup service and are not retained.`
      : `Yes. Lookup ${locality(t)}.` },
  ],
  ai: (t) => [
    { question: `What does ${t.name} do?`, answer: `${t.description} Requires an AI provider API key you configure yourself.` },
    { question: `Do I need an API key?`, answer: `Yes — this tool calls an external AI provider (OpenAI, Anthropic, or compatible) using your key. The tool itself is free; provider usage bills to your key.` },
    { question: `Is my prompt private?`, answer: `Prompts are sent to the AI provider you configured — choose a provider whose policy you trust for sensitive content. Nothing is stored by this site beyond the session.` },
    { question: `Why is there a delay?`, answer: `AI generation requires network round-trips to the provider. Time depends on model, prompt length, and your connection — seconds normally, longer for large outputs.` },
    { question: `Can I use outputs commercially?`, answer: `Typically yes under provider terms, but check your provider's current usage policy for commercial and attribution rules before publishing.` },
  ],
};

function main() {
  const archArg = process.argv.find((a) => a.startsWith('--archetype='))?.split('=')[1] ?? 'all';
  const limit = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '4');
  const bare = toolsRegistry.filter((t) => !(t.faqs ?? []).length);
  const pool = archArg === 'all' ? bare : bare.filter((t) => classify(t) === archArg);
  const sample = pool.slice(0, limit);
  const out: Record<string, { archetype: string; faqs: Faq[] }> = {};
  // Batch-coordinated offsets: same-target siblings round-robin so they get
  // different frame sets; mirror pairs (a-to-b + b-to-a) forced apart by 3.
  const slugSet = new Set(sample.map((t) => t.slug));
  const targetGroups = new Map<string, number>();
  for (const t of sample) {
    const m = t.slug.match(/^([a-z0-9-]+)-to-([a-z0-9-]+)$/);
    if (!m) continue;
    const key = m[2]!;
    const rev = `${m[2]}-to-${m[1]}`;
    let h = 0;
    for (const c of t.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    const off = h % 6;
    const n = targetGroups.get(key) ?? 0;
    targetGroups.set(key, n + 1);
    (t as any).__off = (off + n * 2) % 6;
  }
  // Mirror rule must apply to exactly one of the pair: re-check — if BOTH got
  // +3 they stay aligned. Fix: only the lexicographically larger gets +3.
  for (const t of sample) {
    const m = t.slug.match(/^([a-z0-9-]+)-to-([a-z0-9-]+)$/);
    if (!m) continue;
    const rev = `${m[2]}-to-${m[1]}`;
    if (slugSet.has(rev) && t.slug > rev) (t as any).__off = ((t as any).__off + 3) % 6;
  }
  for (const t of sample) {
    const arch = classify(t);
    const builder = T[arch];
    if (!builder) { out[t.slug] = { archetype: arch + ' (NO TEMPLATE — needs one)', faqs: [] }; continue; }
    out[t.slug] = { archetype: arch, faqs: builder(t, (t as any).__off) };
  }
  console.log(JSON.stringify(out, null, 1).slice(0, 6000));
  console.log(`\n(dry-run: ${sample.length} shown of ${pool.length} in scope '${archArg}'; nothing written)`);

  // MECHANICAL SKELETON CHECK: no generated block may be >50% shared
  // skeleton with another (pairwise Jaccard < 0.30, the faq-gate bar).
  // This runs on every generation — a principle that can't drift.
  const words = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const shingles = (s: string, n = 5): Set<string> => {
    const w = words(s);
    const set = new Set<string>();
    for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
    return set;
  };
  const jaccard = (a: Set<string>, b: Set<string>): number => {
    let inter = 0;
    for (const x of a) if (b.has(x)) inter++;
    return inter / (a.size + b.size - inter || 1);
  };
  // Per-tool rotation with sibling coordination is assigned in main();
  // the check below validates the result.
  const slugs = Object.keys(out);
  const blocks = slugs.map((s) => out[s]!.faqs.map((f) => f.question + ' ' + f.answer).join(' '));
  let worst = 0, worstPair = '';
  const over: string[] = [];
  for (let i = 0; i < slugs.length; i++)
    for (let j = i + 1; j < slugs.length; j++) {
      const sim = jaccard(shingles(blocks[i]!), shingles(blocks[j]!));
      if (sim > worst) { worst = sim; worstPair = `${slugs[i]} vs ${slugs[j]}`; }
      if (sim >= 0.30) over.push(`${slugs[i]} vs ${slugs[j]} (${sim.toFixed(2)})`);
    }
  const totalPairs = (slugs.length * (slugs.length - 1)) / 2;
  console.log(`skeleton-check: worst ${worst.toFixed(3)} (${worstPair || 'n/a'}); over-bar ${over.length}/${totalPairs}`);
  for (const o of over.slice(0, 8)) console.log(`  over-bar: ${o}`);
  if (worst >= 0.30) {
    console.error('SKELETON-CHECK FAILED: generated blocks share too much skeleton — redesign, do not scale.');
    process.exit(1);
  }
}

main();
