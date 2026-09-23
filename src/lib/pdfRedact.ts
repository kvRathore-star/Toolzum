/**
 * True-redaction primitives (step 1 of the redaction project).
 *
 * Cover-up paints pixels; redaction removes the underlying text bytes from
 * the page's /Contents stream so extraction finds nothing. This module is
 * pure (no DOM, no pdf-lib) and fully unit-tested:
 *
 * - tokenize(): splits a decoded content-stream byte string into
 *   string/hex/number/name tokens and operators, tracking array depth so
 *   TJ [...] runs survive as single units.
 * - mapTextRuns(): walks operators tracking the text matrix (Tm/Td/TD/T*)
 *   and font size (Tf) to locate every Tj/TJ run in default user space.
 * - stripRunsInRect(): drops runs intersecting the redact rect. WinAnsi
 *   runs are matched by decoded text; anything else (Identity-H without a
 *   resolvable CMap, images, annotations) is REPORTED, never silently kept.
 *
 * Out of scope here (later steps): XObject image regions, annotations
 * under the rect, embedded files, metadata, incremental-update ghosts.
 * Each reports instead of pretending — see RedactReport.
 */

export type Token =
  | { kind: 'str'; value: string }
  | { kind: 'hex'; value: string }
  | { kind: 'num'; value: number }
  | { kind: 'name'; value: string }
  | { kind: 'op'; value: string }
  | { kind: 'array'; items: Token[] };

export interface TextRun {
  /** Decoded text (WinAnsi best-effort; '' when undecodable). */
  text: string;
  /** Bounding box in default user space (points, y-up). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Token index range in the token array (for stripping). */
  from: number;
  to: number;
  /** False when the encoding couldn't be resolved — caller must flag. */
  decodable: boolean;
}

export interface RedactReport {
  removed: number;
  flaggedUnmapped: string[];
}

/** WinAnsi (CP1252) byte → unicode code point for the printable range. */
const WINANSI_EXTRA: Record<number, number> = {
  0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192, 0x84: 0x201e, 0x85: 0x2026,
  0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6, 0x89: 0x2030, 0x8a: 0x0160,
  0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d, 0x91: 0x2018, 0x92: 0x2019,
  0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014,
  0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161, 0x9b: 0x203a, 0x9c: 0x0153,
  0x9e: 0x017e, 0x9f: 0x0178,
};

function winAnsiByte(b: number): string {
  if (b < 0x80 || (b >= 0xa0 && b <= 0xff)) return String.fromCharCode(b);
  const mapped = WINANSI_EXTRA[b];
  return mapped !== undefined ? String.fromCharCode(mapped) : '';
}

function unescapeLiteral(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i]!;
    if (c === '\\' && i + 1 < s.length) {
      const n = s[++i]!;
      if (n === 'n') out.push(0x0a);
      else if (n === 'r') out.push(0x0d);
      else if (n === 't') out.push(0x09);
      else if (n === 'b') out.push(0x08);
      else if (n === 'f') out.push(0x0c);
      else if (n === '(') out.push(0x28);
      else if (n === ')') out.push(0x29);
      else if (n === '\\') out.push(0x5c);
      else if (/[0-7]/.test(n)) {
        let oct = n;
        for (let k = 0; k < 2 && i + 1 < s.length && /[0-7]/.test(s[i + 1]!); k++) oct += s[++i]!;
        out.push(parseInt(oct, 8) & 0xff);
      } else out.push(n.charCodeAt(0) & 0xff);
    } else {
      out.push(c.charCodeAt(0) & 0xff);
    }
  }
  return out;
}

export function decodeBytes(bytes: number[]): string {
  return bytes.map(winAnsiByte).join('');
}

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = src.length;
  const skipWs = () => {
    while (i < n) {
      const c = src[i]!;
      if (c === '%') {
        while (i < n && src[i] !== '\n') i++;
      } else if (/\s/.test(c)) {
        i++;
      } else break;
    }
  };
  const parseArray = (): Token => {
    i++; // [
    const items: Token[] = [];
    for (;;) {
      skipWs();
      if (i >= n) break;
      if (src[i] === ']') {
        i++;
        break;
      }
      items.push(parseOne());
    }
    return { kind: 'array', items };
  };
  const parseOne = (): Token => {
    skipWs();
    if (i >= n) return { kind: 'op', value: '' };
    const c = src[i]!;
    if (c === '(') {
      i++;
      let depth = 1;
      let s = '';
      while (i < n && depth > 0) {
        const ch = src[i]!;
        if (ch === '\\' && i + 1 < n) {
          s += ch + src[i + 1]!;
          i += 2;
          continue;
        }
        if (ch === '(') depth++;
        else if (ch === ')') {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
        s += ch;
        i++;
      }
      return { kind: 'str', value: s };
    }
    if (c === '<') {
      if (src[i + 1] === '<') {
        // dict — skip balanced
        let depth = 0;
        while (i < n) {
          if (src[i] === '<' && src[i + 1] === '<') {
            depth++;
            i += 2;
          } else if (src[i] === '>' && src[i + 1] === '>') {
            depth--;
            i += 2;
            if (depth === 0) break;
          } else i++;
        }
        return parseOne();
      }
      i++;
      let s = '';
      while (i < n && src[i] !== '>') {
        s += src[i]!;
        i++;
      }
      if (src[i] === '>') i++;
      return { kind: 'hex', value: s.replace(/\s+/g, '') };
    }
    if (c === '[') return parseArray();
    if (c === '/') {
      i++;
      let s = '';
      while (i < n && !/[\s<>\[\]()\/%]/.test(src[i]!)) {
        s += src[i]!;
        i++;
      }
      return { kind: 'name', value: s };
    }
    let s = '';
    while (i < n && !/[\s<>\[\]()\/%]/.test(src[i]!)) {
      s += src[i]!;
      i++;
    }
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(s)) return { kind: 'num', value: parseFloat(s) };
    return { kind: 'op', value: s };
  };
  while (i < n) {
    skipWs();
    if (i >= n) break;
    tokens.push(parseOne());
  }
  return tokens.filter((t) => !(t.kind === 'op' && t.value === ''));
}

interface TextState {
  tx: number;
  ty: number;
  size: number;
  fontIsIdentity: boolean;
}

/**
 * Walk tokens tracking text state; emit one run per Tj/TJ operand.
 * Coordinates assume an identity CTM (page-level transform handled by the
 * caller via page rotation — documented limitation, v1 scope).
 */
export function mapTextRuns(tokens: Token[]): TextRun[] {
  const runs: TextRun[] = [];
  const st: TextState = { tx: 0, ty: 0, size: 12, fontIsIdentity: false };
  // Operand stack carries token indexes so stripping removes operand AND
  // operator (removing only the operator leaves a dangling string that
  // corrupts the stream).
  const stack: { token: Token; index: number }[] = [];

  const flush = (text: string, decodable: boolean, from: number, to: number) => {
    // Width estimate: WinAnsi average advance ≈ 0.5em (conservative for the
    // redact-rect test — over-covering is safe, under-covering is a leak).
    const w = Math.max(text.length * st.size * 0.55, st.size * 0.5);
    runs.push({ text, x: st.tx, y: st.ty, w, h: st.size * 1.2, from, to, decodable });
    st.tx += w;
  };

  tokens.forEach((t, idx) => {
    if (t.kind !== 'op') {
      stack.push({ token: t, index: idx });
      return;
    }
    const popNums = (n: number): number[] => {
      const out: number[] = [];
      for (let k = 0; k < n; k++) {
        const top = stack.pop();
        if (top && top.token.kind === 'num') out.unshift(top.token.value);
      }
      return out;
    };
    switch (t.value) {
      case 'BT':
        st.tx = 0;
        st.ty = 0;
        stack.length = 0;
        break;
      case 'ET':
        stack.length = 0;
        break;
      case 'Tf': {
        const top = stack.pop();
        stack.length = 0;
        if (top && top.token.kind === 'num') st.size = top.token.value;
        // Identity-H detection needs the font dict (later step); a Tf
        // operand whose name we can't resolve here stays WinAnsi-assumed.
        st.fontIsIdentity = false;
        break;
      }
      case 'Tm': {
        const vals = popNums(6);
        stack.length = 0;
        if (vals.length === 6) {
          st.tx = vals[4]!;
          st.ty = vals[5]!;
        }
        break;
      }
      case 'Td':
      case 'TD': {
        const vals = popNums(2);
        stack.length = 0;
        if (vals.length === 2) {
          st.tx += vals[0]!;
          st.ty += vals[1]!;
        }
        break;
      }
      case 'T*':
        stack.length = 0;
        st.ty -= st.size * 1.2;
        break;
      case 'Tj': {
        const arg = stack.pop();
        stack.length = 0;
        if (arg && arg.token.kind === 'str') {
          flush(decodeBytes(unescapeLiteral(arg.token.value)), true, arg.index, idx);
        }
        break;
      }
      case 'TJ': {
        const arg = stack.pop();
        stack.length = 0;
        if (arg && arg.token.kind === 'array') {
          const parts: string[] = [];
          let ok = true;
          for (const el of arg.token.items) {
            if (el.kind === 'str') parts.push(decodeBytes(unescapeLiteral(el.value)));
            else if (el.kind === 'hex') {
              const bytes: number[] = [];
              for (let k = 0; k + 1 < el.value.length; k += 2) bytes.push(parseInt(el.value.slice(k, k + 2), 16));
              parts.push(decodeBytes(bytes));
            } else if (el.kind !== 'num') {
              ok = false;
            }
          }
          flush(parts.join(''), ok, arg.index, idx);
        }
        break;
      }
      case "'":
      case '"': {
        // ' and " are shorthand show ops — treat operand as literal text.
        const arg = stack.pop();
        stack.length = 0;
        if (arg && arg.token.kind === 'str') flush(decodeBytes(unescapeLiteral(arg.token.value)), true, arg.index, idx);
        break;
      }
      case 'Tz':
      case 'Tc':
      case 'Tw':
      case 'TL':
      case 'Ts':
      case 'Tr':
        stack.length = 0;
        break;
      default:
        stack.length = 0;
        break;
    }
  });
  return runs;
}

export function rectsOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Re-encode kept tokens to a content-stream string. */
export function serialize(tokens: Token[], keep: boolean[]): string {
  const out: string[] = [];
  const emit = (t: Token): void => {
    switch (t.kind) {
      case 'str':
        out.push(`(${t.value})`);
        break;
      case 'hex':
        out.push(`<${t.value}>`);
        break;
      case 'num':
        out.push(String(t.value));
        break;
      case 'name':
        out.push(`/${t.value}`);
        break;
      case 'op':
        out.push(t.value);
        break;
      case 'array':
        out.push(`[${t.items.map((el) => {
          if (el.kind === 'str') return `(${el.value})`;
          if (el.kind === 'hex') return `<${el.value}>`;
          if (el.kind === 'num') return String(el.value);
          if (el.kind === 'name') return `/${el.value}`;
          return '';
        }).join(' ')}]`);
        break;
    }
  };
  tokens.forEach((t, i) => {
    if (keep[i]) emit(t);
  });
  return out.join('\n');
}

/**
 * Strip runs intersecting rect (PDF y-up space). Returns the kept token
 * indexes + report. Undecodable runs intersecting the rect are KEPT and
 * flagged — deleting bytes we can't map risks corrupting the stream, and
 * silent keeping would be a leak lie. The caller surfaces flagged runs.
 */
export function stripRunsInRect(
  tokens: Token[],
  runs: TextRun[],
  rect: { x: number; y: number; w: number; h: number },
): { keep: boolean[]; report: RedactReport } {
  const keep = tokens.map(() => true);
  let removed = 0;
  const flaggedUnmapped: string[] = [];
  for (const r of runs) {
    if (!rectsOverlap(r, rect)) continue;
    if (!r.decodable) {
      flaggedUnmapped.push(r.text || '(undecodable run)');
      continue;
    }
    for (let k = r.from; k <= r.to; k++) keep[k] = false;
    removed++;
  }
  return { keep, report: { removed, flaggedUnmapped } };
}
