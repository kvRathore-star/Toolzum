import type { ToolMetadata } from './tools-types';

function wordsOf(tool: ToolMetadata): string[] {
  return (tool.name + " " + tool.description).toLowerCase().split(/\W+/).filter((w) => w.length > 2);
}

export function findRelatedTools(tool: ToolMetadata, registry: ToolMetadata[], maxResults = 6): ToolMetadata[] {
  const toolWords = new Set(wordsOf(tool));
  const candidates = registry.filter((t) => t.slug !== tool.slug);

  function score(t: ToolMetadata): number {
    const candidateWords = wordsOf(t);
    let intersection = 0;
    for (const w of candidateWords) {
      if (toolWords.has(w)) intersection++;
    }
    return intersection;
  }

  const sameCategory = candidates.filter((t) => t.category === tool.category);
  const crossCategory = candidates.filter((t) => t.category !== tool.category);

  const rankedSame = sameCategory.sort((a, b) => score(b) - score(a)).slice(0, 4);
  const rankedCross = crossCategory.sort((a, b) => score(b) - score(a)).slice(0, 3);

  return [...rankedSame.slice(0, 3), ...rankedCross.slice(0, 2)].slice(0, maxResults);
}
