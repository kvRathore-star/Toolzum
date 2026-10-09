import type { ToolMetadata } from './tools-types';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'your', 'you', 'are', 'was',
  'not', 'but', 'have', 'has', 'had', 'can', 'may', 'will', 'all', 'any', 'each',
  'make', 'use', 'used', 'using', 'run', 'runs', 'running', 'online', 'free',
  'browser', 'local', 'locally', 'everything', 'nothing', 'uploaded', 'device',
  'data', 'tool', 'tools', 'input', 'output', 'file', 'files', 'format', 'formats',
  'convert', 'converter', 'calculator', 'generator', 'checker', 'editor', 'viewer',
  'download', 'upload', 'click', 'enter', 'select', 'results', 'result', 'process',
  'processing', 'works', 'supports', 'support', 'includes', 'include', 'provides',
  'features', 'feature', 'complete', 'simple', 'quick', 'easy', 'fast', 'instant',
  'client', 'side', 'server', 'upload', 'sign', 'account', 'required', 'register',
  'registration', 'hidden', 'charges', 'limits', 'limit', 'impose', 'performance',
  'depends', 'memory', 'responsive', 'phone', 'tablet', 'desktop', 'protected',
  'stored', 'encrypted', 'stored', 'shared', 'save', 'saved', 'left', 'never',
  'leave', 'leaves', 'entirely', 'initial', 'page', 'load', 'after', 'before',
  'works', 'works', 'fully', 'operation', 'operation', 'operations', 'images',
  'image', 'audio', 'video', 'text', 'document', 'pdf', 'web', 'app', 'apps',
  'web', 'site', 'pages', 'page', 'content', 'based', 'type', 'types', 'kind',
  'allows', 'allow', 'lets', 'let', 'enable', 'enables', 'helps', 'help',
]);

function wordsOf(tool: ToolMetadata): string[] {
  return (tool.name + " " + tool.description).toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function findRelatedTools(tool: ToolMetadata, registry: ToolMetadata[], maxResults = 6): ToolMetadata[] {
  // Tokenize once per tool (module-scope cache was lost in the STOP_WORDS
  // rewrite and ranking re-tokenized per comparison at static-gen).
  const wordCache = new Map<string, Set<string>>();
  const wordsFor = (t: ToolMetadata): Set<string> => {
    let s = wordCache.get(t.slug);
    if (!s) {
      s = new Set(wordsOf(t));
      wordCache.set(t.slug, s);
    }
    return s;
  };
  const toolWords = wordsFor(tool);
  const candidates = registry.filter((t) => t.slug !== tool.slug);

  function score(t: ToolMetadata): number {
    const candidateWords = wordsFor(t);
    let intersection = 0;
    for (const w of candidateWords) {
      if (toolWords.has(w)) intersection++;
    }
    // Bonus for same category
    const catBonus = t.category === tool.category ? 3 : 0;
    return intersection + catBonus;
  }

  const sameCategory = candidates.filter((t) => t.category === tool.category);
  const crossCategory = candidates.filter((t) => t.category !== tool.category);

  const rankedSame = sameCategory.sort((a, b) => score(b) - score(a)).slice(0, 4);
  const rankedCross = crossCategory.sort((a, b) => score(b) - score(a)).slice(0, 3);

  return [...rankedSame.slice(0, 3), ...rankedCross.slice(0, 2)].slice(0, maxResults);
}
