"use client";

export type TransformDef = {
  slug: string;
  name: string;
  inputPlaceholder: string;
  outputLabel: string;
  description: string;
  convert: (input: string) => string;
};

const CSS_TO_SCSS = (i: string) => i;

const SCSS_TO_CSS = (i: string) =>
  i.replace(/\$(\w+):\s*([^;]+);/g, '/* $1: $2 */')
    .replace(/&/g, '').replace(/\n\s*/g, ' ')
    .replace(/\s*([{}:;])\s*/g, '$1').replace(/;}/g, '}').trim();

const LESS_TO_CSS = (i: string) => i.replace(/@(\w+)/g, '/* $1 */');

const STYLUS_TO_CSS = (i: string) => {
  let r = '', d = 0;
  i.split('\n').forEach(l => {
    const c = l.trim();
    if (!c || c.startsWith('//')) return;
    if (c.startsWith('&:') || c.startsWith('.')) {
      while (d > 0) { r += '}'; d--; }
      r += `${c.replace('&', '').trim()} { `;
      d++;
    } else if (c.includes(' ')) {
      const [p, ...v] = c.split(' ');
      r += `${p}: ${v.join(' ')}; `;
    }
  });
  while (d > 0) { r += ' }'; d--; }
  return r;
};

const TAILWIND_MAP: Record<string, string> = {
  flex: 'display:flex;', 'items-center':'align-items:center;', 'justify-center':'justify-content:center;',
  'justify-between':'justify-content:space-between;', 'flex-col':'flex-direction:column;',
  'gap-2':'gap:0.5rem;', 'gap-4':'gap:1rem;', 'p-2':'padding:0.5rem;', 'p-4':'padding:1rem;',
  'm-4':'margin:1rem;', 'mt-2':'margin-top:0.5rem;', 'mb-4':'margin-bottom:1rem;',
  'text-sm':'font-size:0.875rem;', 'text-lg':'font-size:1.125rem;', 'font-bold':'font-weight:700;',
  'text-white':'color:#fff;', 'bg-white':'background-color:#fff;',
  'bg-blue-500':'background-color:#3b82f6;', 'bg-red-500':'background-color:#ef4444;',
  rounded:'border-radius:0.25rem;', 'rounded-lg':'border-radius:0.5rem;',
  shadow:'box-shadow:0 1px 3px rgba(0,0,0,0.1);', 'shadow-md':'box-shadow:0 4px 6px rgba(0,0,0,0.1);',
  'w-full':'width:100%;', hidden:'display:none;', block:'display:block;',
  relative:'position:relative;', absolute:'position:absolute;',
};

const TAILWIND_TO_CSS = (i: string) =>
  i.split(/\s+/).filter(Boolean).map(c => `  ${TAILWIND_MAP[c] || `/* ${c}: not found */`}`).join('\n');

const HTML_TO_JSX = (i: string) =>
  i.replace(/class=/g,'className=').replace(/for=/g,'htmlFor=').replace(/tabindex=/g,'tabIndex=')
    .replace(/autocomplete=/g,'autoComplete=').replace(/autofocus=/g,'autoFocus=')
    .replace(/contenteditable=/g,'contentEditable=').replace(/autoplay=/g,'autoPlay=')
    .replace(/enctype=/g,'encType=');

const HTML_TO_TEXT = (i: string) =>
  i.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&')
   .replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').trim();

const TEXT_TO_HTML = (i: string) =>
  '<p>' + i.split('\n').filter(Boolean).map(l => l.trim()).join('</p>\n<p>') + '</p>';

const BINARY_TO_TEXT = (i: string) =>
  i.split(' ').filter(Boolean).map(b => String.fromCharCode(parseInt(b, 2))).join('');

const TEXT_TO_BINARY = (i: string) =>
  i.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');

const HEX_TO_TEXT = (i: string) =>
  i.trim().startsWith('0x')
    ? String.fromCharCode(parseInt(i, 16))
    : i.split(/\s+/).filter(Boolean).map(h => String.fromCharCode(parseInt(h, 16))).join('');

const NUMBER_BASE = (i: string) => {
  const n = parseInt(i, 10);
  if (isNaN(n)) return 'Enter a valid decimal number';
  return `Binary:  ${n.toString(2)}\nOctal:   ${n.toString(8)}\nHex:     ${n.toString(16).toUpperCase()}\nDecimal: ${n}`;
};

const CASE_CONVERTER = (i: string) => {
  const w = i.match(/[A-Za-z0-9]+/g) || [];
  return [
    `UPPER:      ${i.toUpperCase()}`,
    `lower:      ${i.toLowerCase()}`,
    `Title:      ${w.map(x => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(' ')}`,
    `camelCase:  ${w.map((x, j) => j === 0 ? x.toLowerCase() : x[0].toUpperCase() + x.slice(1).toLowerCase()).join('')}`,
    `snake_case: ${w.map(x => x.toLowerCase()).join('_')}`,
    `kebab-case: ${w.map(x => x.toLowerCase()).join('-')}`,
    `UPPER_SNAKE:${w.map(x => x.toUpperCase()).join('_')}`,
  ].join('\n');
};

const YAML_TO_JSON = (i: string) => {
  try {
    const o: Record<string, string> = {};
    i.split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).forEach(l => {
      const m = l.match(/^(\w+):\s*(.*)/);
      if (m) o[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    });
    return JSON.stringify(o, null, 2);
  } catch { return 'Invalid YAML'; }
};

const INI_TO_JSON = (i: string) => {
  try {
    const o: Record<string, any> = {}; let s = '';
    i.split('\n').forEach(l => {
      const sec = l.match(/^\[(\w+)\]/);
      if (sec) { s = sec[1]; o[s] = {}; return; }
      const m = l.match(/^(\w+)\s*=\s*(.*)/);
      if (m) { if (s) o[s][m[1]] = m[2]; else o[m[1]] = m[2]; }
    });
    return JSON.stringify(o, null, 2);
  } catch { return 'Invalid INI'; }
};

const TOML_TO_JSON = (i: string) => {
  try {
    const o: Record<string, any> = {}; let s = '';
    i.split('\n').forEach(l => {
      const sec = l.match(/^\[(\w+)\]/);
      if (sec) { s = sec[1]; o[s] = {}; return; }
      const m = l.match(/^(\w+)\s*=\s*(.*)/);
      if (m) {
        let v: any = m[2].replace(/^['"]|['"]$/g, '');
        if (!isNaN(Number(v))) v = Number(v);
        else if (v === 'true') v = true;
        else if (v === 'false') v = false;
        if (s) o[s][m[1]] = v; else o[m[1]] = v;
      }
    });
    return JSON.stringify(o, null, 2);
  } catch { return 'Invalid TOML'; }
};

const JSON_TO_YAML = (i: string) => {
  try {
    const o = JSON.parse(i);
    const fmt = (obj: Record<string, any>, prefix = ''): string =>
      Object.entries(obj).map(([k, v]) => {
        if (typeof v === 'object' && v !== null && !Array.isArray(v))
          return `${prefix}${k}:\n${fmt(v, prefix + '  ')}`;
        const val = typeof v === 'string' ? `"${v}"` : String(v);
        return `${prefix}${k}: ${val}`;
      }).join('\n');
    return fmt(o);
  } catch { return 'Invalid JSON'; }
};

const JSON_TO_INI = (i: string) => {
  try {
    const o = JSON.parse(i);
    const out: string[] = [];
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        out.push(`[${k}]`);
        for (const [sk, sv] of Object.entries(v as Record<string, any>))
          out.push(`${sk}=${sv}`);
      } else {
        out.push(`${k}=${v}`);
      }
    }
    return out.join('\n');
  } catch { return 'Invalid JSON'; }
};

const JSON_TO_TOML = (i: string) => {
  try {
    const o = JSON.parse(i);
    const out: string[] = [];
    const fmt = (v: any): string => {
      if (typeof v === 'string') return `"${v}"`;
      if (typeof v === 'boolean') return v ? 'true' : 'false';
      return String(v);
    };
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        out.push(`[${k}]`);
        for (const [sk, sv] of Object.entries(v as Record<string, any>))
          out.push(`${sk} = ${fmt(sv)}`);
      } else {
        out.push(`${k} = ${fmt(v)}`);
      }
    }
    return out.join('\n');
  } catch { return 'Invalid JSON'; }
};

const TIMEZONE_CONVERTER = (i: string) => {
  const d = new Date();
  const tz = i.trim() || 'UTC';
  try {
    return `${d.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'long', hour12: false })}\n\nUTC: ${d.toUTCString()}\nLocal: ${d.toLocaleString()}`;
  } catch { return `Invalid timezone "${tz}". Try "America/New_York", "Europe/London", "Asia/Tokyo".`; }
};

const UNIX_TIME = (i: string) => {
  const n = parseInt(i, 10);
  if (isNaN(n)) return 'Enter a valid Unix timestamp';
  return new Date(n * 1000).toLocaleString('en-US', { timeZone: 'UTC', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' UTC';
};

const CURL_TO_CODE = (i: string) => {
  const url = (i.match(/'([^']+)'/) || i.match(/"([^"]+)"/) || ['',''])[1];
  const m = (i.match(/-X (\w+)/) || ['','GET'])[1];
  return `fetch("${url}", {\n  method: "${m}",\n  headers: ${JSON.stringify(Object.fromEntries((i.match(/-H\s+'([^']+):\s*([^']+)'/g) || []).map(h => { const x = h.match(/-H\s+'([^']+):\s*([^']+)'/); return x ? [x[1], x[2]] : []; })), null, 2)},\n})`;
};

const JSON_TO_CODE = (i: string) => {
  try {
    const o = JSON.parse(i);
    return `// TypeScript interface\nexport interface GeneratedType {\n${Object.entries(o).map(([k, v]) => `  ${k}: ${typeof v === 'string' ? 'string' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : Array.isArray(v) ? 'any[]' : 'object'};`).join('\n')}\n}`;
  } catch { return 'Invalid JSON'; }
};

const CSS_TO_LESS = (i: string) =>
  i.replace(/--([\w-]+)\s*:\s*([^;]+);/g, '@$1: $2;');

const CSS_TO_STYLUS = (i: string) => {
  const lines = i.split('\n');
  const out: string[] = [];
  let indent = 0;
  for (const raw of lines) {
    const l = raw.trim();
    if (!l) continue;
    if (l.startsWith('}')) indent = Math.max(0, indent - 1);
    const prefix = '  '.repeat(indent);
    if (l.endsWith('{')) {
      const sel = l.replace(/\s*\{\s*$/, '');
      out.push(prefix + sel);
      indent++;
    } else if (l.includes(':') && l.endsWith(';')) {
      out.push(prefix + l.replace(/;\s*$/, ''));
    } else {
      out.push(prefix + l);
    }
  }
  return out.join('\n');
};

const SVG_TO_CSS = (i: string) => {
  const w = i.match(/width="([^"]+)"/)?.[1] || 'auto';
  const h = i.match(/height="([^"]+)"/)?.[1] || 'auto';
  try {
    const enc = btoa(i);
    return `.svg-background {\n  width: ${w};\n  height: ${h};\n  background-image: url("data:image/svg+xml;base64,${enc}");\n  background-size: contain;\n  background-repeat: no-repeat;\n}`;
  } catch { return 'Invalid SVG'; }
};

export const TRANSFORM_CONFIG: Record<string, TransformDef> = {
  "css-to-scss-converter": { slug:"css-to-scss-converter",name:"CSS → SCSS",inputPlaceholder:`.container {\n  color: red;\n}`,outputLabel:"SCSS Output",description:"Convert CSS with nesting into SCSS syntax",convert:CSS_TO_SCSS},
  "scss-to-css-converter": { slug:"scss-to-css-converter",name:"SCSS → CSS",inputPlaceholder:"$primary: #3b82f6;\n.btn { color: $primary; }",outputLabel:"CSS Output",description:"Convert SCSS variables and nesting to standard CSS",convert:SCSS_TO_CSS},
  "less-to-css-converter": { slug:"less-to-css-converter",name:"Less → CSS",inputPlaceholder:"@primary: #333;\nbody { color: @primary; }",outputLabel:"CSS Output",description:"Convert Less variables to standard CSS",convert:LESS_TO_CSS},
  "css-to-less-converter": { slug:"css-to-less-converter",name:"CSS → Less",inputPlaceholder:":root {\n  --primary: #333;\n}\nbody { color: var(--primary); }",outputLabel:"Less Output",description:"Convert CSS variables to Less syntax",convert:CSS_TO_LESS},
  "stylus-to-css-converter": { slug:"stylus-to-css-converter",name:"Stylus → CSS",inputPlaceholder:`.btn\n  color #3b82f6\n  font-weight bold`,outputLabel:"CSS Output",description:"Convert Stylus indentation syntax to CSS",convert:STYLUS_TO_CSS},
  "css-to-stylus-converter": { slug:"css-to-stylus-converter",name:"CSS → Stylus",inputPlaceholder:".btn {\n  color: #3b82f6;\n  font-weight: bold;\n}",outputLabel:"Stylus Output",description:"Convert CSS braces/semicolons to Stylus indentation syntax",convert:CSS_TO_STYLUS},
  "tailwind-to-css-converter": { slug:"tailwind-to-css-converter",name:"Tailwind → CSS",inputPlaceholder:"flex items-center justify-between p-4",outputLabel:"CSS Output",description:"Convert Tailwind classes to CSS rules",convert:TAILWIND_TO_CSS},
  "html-to-jsx": { slug:"html-to-jsx",name:"HTML → JSX",inputPlaceholder:'<div class="container"><label for="email">Email</label></div>',outputLabel:"JSX Output",description:"Convert HTML attributes to React JSX equivalents",convert:HTML_TO_JSX},
  "html-to-text-converter": { slug:"html-to-text-converter",name:"HTML → Text",inputPlaceholder:"<p>Hello <strong>world</strong></p>",outputLabel:"Plain Text",description:"Strip HTML tags and decode entities",convert:HTML_TO_TEXT},
  "text-to-html-converter": { slug:"text-to-html-converter",name:"Text → HTML",inputPlaceholder:"Line one\nLine two",outputLabel:"HTML Output",description:"Wrap plain text lines in <p> tags",convert:TEXT_TO_HTML},
  "code-to-curl-converter": { slug:"code-to-curl-converter",name:"cURL → Fetch",inputPlaceholder:"curl -X POST 'https://api.example.com/data' -H 'Content-Type: application/json'",outputLabel:"JavaScript Fetch",description:"Convert cURL commands to JavaScript fetch code",convert:CURL_TO_CODE},
  "json-to-code": { slug:"json-to-code",name:"JSON → TypeScript",inputPlaceholder:'{"name":"John","age":30}',outputLabel:"TypeScript Interface",description:"Generate TypeScript interface from JSON",convert:JSON_TO_CODE},
  "svg-to-css": { slug:"svg-to-css",name:"SVG → CSS",inputPlaceholder:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="blue"/></svg>',outputLabel:"CSS Output",description:"Encode SVG as inline CSS background-image",convert:SVG_TO_CSS},
  "binary-to-text": { slug:"binary-to-text",name:"Binary → Text",inputPlaceholder:"01001000 01100101 01101100 01101100 01101111",outputLabel:"Decoded Text",description:"Convert binary to ASCII text",convert:BINARY_TO_TEXT},
  "text-to-binary": { slug:"text-to-binary",name:"Text → Binary",inputPlaceholder:"Hello",outputLabel:"Binary Output",description:"Convert text to binary representation",convert:TEXT_TO_BINARY},
  "hex-text-converter": { slug:"hex-text-converter",name:"Hex → Text",inputPlaceholder:"48 65 6C 6C 6F",outputLabel:"Decoded Text",description:"Convert hexadecimal to text",convert:HEX_TO_TEXT},
  "hex-ascii-converter": { slug:"hex-ascii-converter",name:"Hex → ASCII",inputPlaceholder:"48 65 6C 6C 6F",outputLabel:"ASCII Output",description:"Convert hex bytes to ASCII",convert:HEX_TO_TEXT},
  "number-base-converter": { slug:"number-base-converter",name:"Number Base",inputPlaceholder:"255",outputLabel:"Conversions",description:"Convert between binary, octal, decimal, hex",convert:NUMBER_BASE},
  "yaml-json-converter": { slug:"yaml-json-converter",name:"YAML → JSON",inputPlaceholder:"name: John\nage: 30",outputLabel:"JSON Output",description:"Convert YAML to JSON",convert:YAML_TO_JSON},
  "json-to-yaml-converter": { slug:"json-to-yaml-converter",name:"JSON → YAML",inputPlaceholder:'{"name":"John","age":30}',outputLabel:"YAML Output",description:"Convert JSON to YAML",convert:JSON_TO_YAML},
  "ini-json-converter": { slug:"ini-json-converter",name:"INI → JSON",inputPlaceholder:"[database]\nhost = localhost\nport = 5432",outputLabel:"JSON Output",description:"Convert INI config to JSON",convert:INI_TO_JSON},
  "json-to-ini-converter": { slug:"json-to-ini-converter",name:"JSON → INI",inputPlaceholder:'{"database":{"host":"localhost","port":5432}}',outputLabel:"INI Output",description:"Convert JSON to INI config format",convert:JSON_TO_INI},
  "toml-converter": { slug:"toml-converter",name:"TOML → JSON",inputPlaceholder:'title = "Example"\n[server]\nhost = "localhost"',outputLabel:"JSON Output",description:"Convert TOML config to JSON",convert:TOML_TO_JSON},
  "json-to-toml-converter": { slug:"json-to-toml-converter",name:"JSON → TOML",inputPlaceholder:'{"title":"Example","server":{"host":"localhost"}}',outputLabel:"TOML Output",description:"Convert JSON to TOML config format",convert:JSON_TO_TOML},
  "case-converter": { slug:"case-converter",name:"Case Converter",inputPlaceholder:"hello world",outputLabel:"All Cases",description:"Convert text between UPPER, lower, Title, camelCase, snake_case, kebab-case",convert:CASE_CONVERTER},
  "time-zone-converter": { slug:"time-zone-converter",name:"Timezone Converter",inputPlaceholder:"America/New_York",outputLabel:"Current Time",description:"Show current time in any IANA timezone",convert:TIMEZONE_CONVERTER},
  "unix-time-converter": { slug:"unix-time-converter",name:"Unix Timestamp",inputPlaceholder:"1700000000",outputLabel:"Formatted Date",description:"Convert Unix timestamp to human-readable date",convert:UNIX_TIME},
  "text-tools": { slug:"text-tools",name:"Text Converter",inputPlaceholder:"hello world",outputLabel:"All Cases",description:"Convert between CSS preprocessors, HTML/JSX, case styles, number bases, serialization formats, and time zones",convert:CASE_CONVERTER},
};
