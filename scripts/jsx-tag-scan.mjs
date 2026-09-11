/**
 * Shared brace-aware JSX tag scanner.
 *
 * Single canonical scanner for all batch scripts that touch JSX. Do NOT
 * rewrite per script — import this module instead.
 *
 * Why this exists (Sep 2026 a11y session): naive attribute matchers like
 * `<input[^>]*>` truncate the tag at the `>` inside `=>` (e.g.
 * `onChange={e => ...}`), hiding every attribute after `onChange` and
 * causing confident-but-wrong batch edits. This scanner tracks `{}` brace
 * depth and `'"`` quotes inside tags, so `>` inside expressions/strings
 * never terminates a tag early.
 *
 * `scanTags(src)` returns a flat list of tags:
 *   { name, closing, selfClosing, start, end, line, attrs, bogus }
 * - `start`/`end` are offsets into `src` (`src.slice(start, end)` is the
 *   full tag including `<`/`>`). Edits anchored here must re-assert the
 *   expected text before writing (offsets shift after each write — apply
 *   writes back-to-front within a file).
 * - `attrs` is `[{ name, value, valueStart, valueEnd }]`; `value` is the raw
 *   source slice (quotes/braces included) or `null` for bare attributes.
 * - `bogus` is true when `<` did not start a real tag (e.g. `a < b`) — the
 *   entry only carries offsets so callers can skip it.
 *
 * Comment/string awareness: `{/* ... *\/}`, `//` (inside brace depth only),
 * and quoted strings are skipped so tags inside them are never reported.
 * Template literals track `${}` nesting. Residual risk: unspaced `<` in
 * code (`a<b?x:y`) may false-positive — callers must validate anchors.
 */

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
  "meta", "param", "source", "track", "wbr",
]);

function isTagNameChar(ch) {
  return /[A-Za-z0-9_$\-.]/.test(ch);
}

function isWordChar(ch) {
  return ch !== undefined && /[A-Za-z0-9_$]/.test(ch);
}

/** True when only whitespace precedes `pos` back to the last newline. */
function atLineStart(src, pos) {
  let k = pos - 1;
  while (k >= 0 && src[k] !== "\n") {
    if (!/\s/.test(src[k])) return false;
    k--;
  }
  return true;
}

function isTagStart(src, i) {
  const c = src[i + 1];
  return c === "/" || c === ">" || (c !== undefined && /[A-Za-z_!$]/.test(c));
}

/** Find ranges (comments/strings) to ignore. Returns sorted [start, end) list. */
export function findIgnoredRanges(src) {
  const ranges = [];
  const n = src.length;
  let i = 0;
  let braceDepth = 0;
  while (i < n) {
    const c = src[i];
    const two = src[i + 1] === undefined ? "" : c + src[i + 1];
    if (c === '"' || c === "'" || c === "`") {
      // Apostrophe guard: `doesn't`, `page's` (JSX text) have word chars on
      // BOTH sides — a real string delimiter never does (`='x'`, `('x'`,
      // `from 'x'`). Also covers escaped text apostrophes (`doesn\'t`).
      const prev = src[i - 1];
      const next = src[i + 1];
      const prevPrev = src[i - 2];
      if (
        isWordChar(prev) && isWordChar(next) ||
        (c === "'" && prev === "\\" && isWordChar(prevPrev) && isWordChar(next))
      ) {
        i++;
        continue;
      }
      const quote = c;
      const start = i;
      i++;
      let tmplStack = quote === "`" ? [] : null;
      while (i < n) {
        const d = src[i];
        if (quote === "`" && d === "$" && src[i + 1] === "{") {
          tmplStack.push(i);
          i += 2;
          let depth = 1;
          while (i < n && depth > 0) {
            const e2 = src[i];
            if (e2 === '"' || e2 === "'" || e2 === "`") {
              const q2 = e2;
              i++;
              while (i < n) {
                if (src[i] === "\\") { i += 2; continue; }
                if (src[i] === q2) { i++; break; }
                i++;
              }
              continue;
            }
            if (e2 === "{") depth++;
            else if (e2 === "}") depth--;
            i++;
          }
          continue;
        }
        if (d === "\\") { i += 2; continue; }
        if (d === quote) { i++; break; }
        i++;
      }
      ranges.push([start, i]);
      void tmplStack;
      continue;
    }
    // `//` line comments live inside expressions (depth > 0). At depth 0
    // they are top-of-file comments — but only when the `//` starts the
    // line (whitespace before it). This keeps JSX text/URLs like
    // `https://…` (prev char `:`) and mid-line `a // b` out of comment mode.
    if (two === "//" && (braceDepth > 0 || (atLineStart(src, i) && src[i - 1] !== ":"))) {
      const start = i;
      while (i < n && src[i] !== "\n") i++;
      ranges.push([start, i]);
      continue;
    }
    if (two === "/*" && (braceDepth > 0 || atLineStart(src, i))) {
      const start = i;
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      ranges.push([start, i]);
      continue;
    }
    if (c === "{") braceDepth++;
    else if (c === "}") braceDepth = Math.max(0, braceDepth - 1);
    i++;
  }
  return ranges;
}

function inRanges(ranges, pos) {
  for (const [s, e] of ranges) {
    if (pos >= s && pos < e) return true;
    if (s > pos) break;
  }
  return false;
}

/**
 * Parse one tag starting at `src[start]` (`<`). Returns tag object or null
 * when `<` does not begin a tag.
 */
function parseTag(src, start) {
  const n = src.length;
  let i = start + 1;
  let closing = false;
  if (src[i] === "/") { closing = true; i++; }
  else if (src[i] === ">") {
    return { name: "", closing: false, selfClosing: false, fragment: true,
      start, end: i + 1, line: 0, attrs: [], bogus: false };
  }
  const nameStart = i;
  while (i < n && isTagNameChar(src[i])) i++;
  const name = src.slice(nameStart, i);
  // `</>` (fragment close) legitimately has no name — only reject nameless
  // OPEN tags here.
  if (!name && !closing) return null;
  // Arrow-function generics (`<T,>(x: T) => ...`) are not JSX: a comma can
  // never directly follow a JSX tag name (attributes need whitespace).
  if (!closing && src[i] === ",") return null;
  // Member expressions: <Foo.Bar /> — keep full dotted name.
  // Lowercase-with-dash (custom elements) already covered by name chars.

  const attrs = [];
  let selfClosing = false;
  let j = i;
  // Attribute loop: brace/quote aware; `>` at depth 0 ends the tag.
  let braceDepth = 0;
  let quote = null;
  while (j < n) {
    const c = src[j];
    if (quote) {
      if (c === "\\") { j += 2; continue; }
      if (c === quote) quote = null;
      j++;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; j++; continue; }
    if (c === "{") { braceDepth++; j++; continue; }
    if (c === "}") { braceDepth = Math.max(0, braceDepth - 1); j++; continue; }
    if (braceDepth === 0 && c === ">") break;
    if (braceDepth === 0 && c === "/" && src[j + 1] === ">") {
      selfClosing = true;
      break;
    }
    j++;
  }
  if (j >= n) return null;
  const tagEnd = selfClosing ? j + 2 : j + 1;

  // Parse attributes from the raw inner slice with a second pass that
  // reuses the same brace/quote discipline via offsets.
  if (!closing) {
    const inner = src.slice(i, selfClosing ? j : j);
    let k = 0;
    const base = i;
    while (k < inner.length) {
      while (k < inner.length && /\s/.test(inner[k])) k++;
      if (k >= inner.length) break;
      if (inner[k] === "/" || inner[k] === ">") break;
      // Spread or expression child inside tag head: skip balanced chunk.
      if (inner[k] === "{") {
        let d = 0, q = null, p = k;
        while (p < inner.length) {
          const ch = inner[p];
          if (q) {
            if (ch === "\\") { p += 2; continue; }
            if (ch === q) q = null;
            p++;
            continue;
          }
          if (ch === '"' || ch === "'") { q = ch; p++; continue; }
          if (ch === "{") d++;
          else if (ch === "}") { d--; if (d === 0) { p++; break; } }
          p++;
        }
        k = p;
        continue;
      }
      const aStart = k;
      while (k < inner.length && /[^\s=/>]/.test(inner[k])) k++;
      const aName = inner.slice(aStart, k);
      if (!aName) { k++; continue; }
      while (k < inner.length && /\s/.test(inner[k])) k++;
      let value = null, valueStart = null, valueEnd = null;
      if (inner[k] === "=") {
        k++;
        while (k < inner.length && /\s/.test(inner[k])) k++;
        const vStart = k;
        if (inner[k] === '"' || inner[k] === "'") {
          const q = inner[k];
          k++;
          while (k < inner.length && inner[k] !== q) {
            if (inner[k] === "\\") k++;
            k++;
          }
          k++; // closing quote
        } else if (inner[k] === "{") {
          let d = 0, q2 = null;
          while (k < inner.length) {
            const ch = inner[k];
            if (q2) {
              if (ch === "\\") { k += 2; continue; }
              if (ch === q2) q2 = null;
              k++;
              continue;
            }
            if (ch === '"' || ch === "'") { q2 = ch; k++; continue; }
            if (ch === "{") d++;
            else if (ch === "}") { d--; if (d === 0) { k++; break; } }
            k++;
          }
        } else {
          while (k < inner.length && /[^\s>]/.test(inner[k])) k++;
        }
        valueStart = base + vStart;
        valueEnd = base + k;
        value = src.slice(valueStart, valueEnd);
      }
      attrs.push({ name: aName, value, valueStart, valueEnd });
    }
  }

  return {
    name, closing, selfClosing, fragment: false,
    start, end: tagEnd, line: 0, attrs, bogus: false,
  };
}

/** Scan `src` and return the flat tag list with 1-based `line` numbers. */
export function scanTags(src) {
  const ignored = findIgnoredRanges(src);
  const tags = [];
  const n = src.length;
  let i = 0;
  while (i < n) {
    if (src[i] === "<" && !inRanges(ignored, i) && isTagStart(src, i)) {
      const isOpen = src[i + 1] !== "/" && src[i + 1] !== ">";
      if (isOpen) {
        // Type generics (`useState<string>`) and comparisons continue an
        // expression — a real JSX open tag never directly follows an
        // identifier char, `)`, `]`, a quote, or `.`. (Closing tags are
        // exempt: JSX text like `Weight (kg)</label>` precedes them.)
        const prev = i > 0 ? src[i - 1] : "";
        if (/[A-Za-z0-9_$\])'"`.]/.test(prev)) { i++; continue; }
      }
      const tag = parseTag(src, i);
      if (tag) {
        tag.line = src.slice(0, tag.start).split("\n").length;
        tags.push(tag);
        i = tag.end;
        continue;
      }
    }
    i++;
  }
  return tags;
}

/**
 * Build an element tree from a flat tag list. Returns `{ roots, errors }`.
 * Nodes: { tag, name, attrs, start, end, openEnd, children, parent, text }.
 * `text` accumulates raw JSX text children (resolves string-literal
 * expressions `{ '...' }` / `{ "..." }` only; anything else → `hasComplex`).
 */
export function buildTree(src, tags) {
  const roots = [];
  const stack = [];
  const errors = [];

  const textOf = (a, b) => src.slice(a, b);

  for (const tag of tags) {
    if (tag.fragment) {
      const node = { tag, name: "<>", attrs: [], start: tag.start,
        end: -1, openEnd: tag.end, children: [], parent: stack[stack.length - 1] || null,
        text: "", hasComplex: false };
      (node.parent ? node.parent.children : roots).push(node);
      stack.push(node);
      continue;
    }
    if (tag.closing) {
      const closeName = tag.name;
      if (closeName === "") {
        const top = stack.pop();
        if (top) top.end = tag.end;
        else errors.push(`stray fragment close at ${tag.start}`);
        continue;
      }
      // Pop until match (tolerate minor imbalance, record it).
      let idx = stack.length - 1;
      while (idx >= 0 && stack[idx].name !== closeName) idx--;
      if (idx < 0) {
        errors.push(`stray closing </${closeName}> at offset ${tag.start}`);
        continue;
      }
      while (stack.length - 1 > idx) {
        const dropped = stack.pop();
        errors.push(`unclosed <${dropped.name}> at offset ${dropped.start}`);
      }
      const top = stack.pop();
      top.closeStart = tag.start;
      top.end = tag.end;
      continue;
    }
    const node = { tag, name: tag.name, attrs: tag.attrs, start: tag.start,
      end: tag.selfClosing || VOID_ELEMENTS.has(tag.name) ? tag.end : -1,
      openEnd: tag.end, children: [],
      parent: stack[stack.length - 1] || null, text: "", hasComplex: false };
    (node.parent ? node.parent.children : roots).push(node);
    if (node.end === -1) {
      stack.push(node);
    } else if (node.parent) {
      // void/self-closing: attribute text gap contributes nothing.
    }
  }
  while (stack.length > 0) {
    const dropped = stack.pop();
    errors.push(`unclosed <${dropped.name}> at offset ${dropped.start}`);
  }

  // Attach JSX text between element boundaries. The owner node is passed
  // explicitly: childless elements (e.g. <label>Query</label>) still own
  // their inner text — a previous version dropped it via kids[0]?.parent.
  const attachText = (owner, kids, outerStart, outerEnd) => {
    let cursor = outerStart;
    for (const kid of kids) {
      addText(owner, textOf(cursor, kid.start));
      cursor = kid.end === -1 ? kid.openEnd : kid.end;
      // Content ends where the closing tag STARTS (closeStart); using `end`
      // (after `>`) would swallow `</label>` into the text.
      const contentEnd = kid.closeStart ?? kid.end;
      attachText(kid, kid.children, kid.openEnd, kid.end === -1 ? kid.openEnd : contentEnd);
    }
    if (outerEnd > cursor) addText(owner, textOf(cursor, outerEnd));
  };

  function addText(node, gap) {
    if (!node || !gap) return;
    // Strip nested-tag residue is unnecessary: gaps contain no tags by construction.
    const trimmed = gap.trim();
    if (!trimmed) return;
    // Pure string-literal expression: { '...' } or { "..." }.
    const m = trimmed.match(/^\{\s*(['"])((?:\\\1|(?!\1).)*)\1\s*\}$/s);
    if (m) {
      node.text += m[2];
      return;
    }
    if (trimmed.startsWith("{")) {
      node.hasComplex = true;
      return;
    }
    node.text += gap.replace(/\s+/g, " ");
  }

  for (const root of roots) {
    const contentEnd = root.closeStart ?? root.end;
    attachText(root, root.children, root.openEnd, root.end === -1 ? root.openEnd : contentEnd);
  }
  // Root-level text ignored (not needed for label pairing).

  return { roots, errors };
}

/** Depth-first walk of tree nodes. */
export function walk(nodes, fn) {
  for (const node of nodes) {
    fn(node);
    walk(node.children, fn);
  }
}

/** Exact-attribute lookup (no substring matching: `id` ≠ `aria-labelledby`). */
export function getAttr(node, name) {
  return node.attrs.find((a) => a.name === name) || null;
}

export function hasAttr(node, name) {
  return node.attrs.some((a) => a.name === name);
}
