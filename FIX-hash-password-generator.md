# FIXED: `hash-password-generator` — PBKDF2 Mislabel + Weak Hash

**Priority:** HIGH (security-labeling bug on a canonical page)
**File:** `src/components/tools/modules/SecurityTools.tsx:194-213`
**Slug:** `hash-password-generator`
**Found:** 2026-07-18 during SecurityToolkit/ConverterToolkit hub refactor
**Fixed:** 2026-07-18

## Problem

The canonical `HashPasswordGenerator` component claimed to generate PBKDF2 hashes (its output format was `$pbkdf2-sha256$v=1<len>$<salt>$<hash>`) but actually performed a single SHA-256(password+salt) digest with zero iterations:

```js
// OLD — SecurityTools.tsx
const data = new TextEncoder().encode(pwd + s);
const buf = await crypto.subtle.digest('SHA-256', data);
const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
setResult(`$pbkdf2-sha256$v=1${s.length}$${s}$${hash}`);
```

This was **not PBKDF2**. PBKDF2 requires an iteration count through `crypto.subtle.deriveBits`. A single SHA-256 digest is trivially fast to brute-force compared to iterated PBKDF2.

## Fix Applied

Replaced with proper PBKDF2 key derivation using `crypto.subtle.deriveBits` at 600,000 iterations (OWASP current recommendation for PBKDF2-SHA256):

```js
// NEW — SecurityTools.tsx
const ITERATIONS = 600000;
const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(pwd), { name: 'PBKDF2' }, false, ['deriveBits']);
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(s), iterations: ITERATIONS, hash: 'SHA-256' }, keyMaterial, 256);
const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
setResult(`$pbkdf2-sha256$iterations=${ITERATIONS}$${s}$${hash}`);
```

### Also fixed in this batch

- **CryptoKit.tsx**: Fixed broken slug `hash-generator` → `hash-password-generator` on the "Hash Password Generator" card (was pointing at the wrong tool — the general hash page instead of the password hashing page). Updated hub description and card description to match.
- **Registry entry**: `description` and `seoDescription` updated from `"bcrypt, PBKDF2, or argon2"` (none of which this page actually did) to `"PBKDF2-SHA256 with 600,000 iterations"`.

## Blast radius

Only the dynamic import in `DynamicModuleWrapper.tsx` and the registry entry reference this slug. No other tool or page reads or parses the output format. Output format changed from `$pbkdf2-sha256$v=1{len}` to `$pbkdf2-sha256$iterations=600000` — distinguishable prefix if a future verifier needs to support both.

## Bonus fixes from hub slug audit (2026-07-18)

A routing-checking side effect found the following additional stale registry metadata issues, all fixed in the same pass:

### Routing bug caught
- **CalculatorKit**: "Calorie Calculator" card slug `calorie-intake-calculator` was wrong — the card name implied one tool but linked to another ("Daily Calorie Needs"). Renamed card to "Daily Calorie Needs".

### Registry naming bugs (one-directional → bidirectional)
- `xlsx-csv-converter`: "XLSX to CSV" → "XLSX ↔ CSV Converter"
- `vcf-csv-converter`: "VCF to CSV" → "VCF ↔ CSV Converter"
- `ics-csv-converter`: "ICS to CSV" → "ICS ↔ CSV Converter"

### Registry description inaccuracies
- `password-strength-checker`: claimed "known-breach database lookup" — tool only uses local zxcvbn, no online check. Description fixed.
- `color-palette-generator`: listed "monochromatic" (not implemented), omitted "triadic" (implemented). Description fixed.
- `brand-color-palette-generator`: said "from a primary color" — tool is AI-powered from brand description. Description fixed.
- `case-converter`: claimed "sentence case" and "PascalCase" (both missing); had unlisted "alternating case". Description fixed.

## Related (not yet fixed)

The SecurityToolkit widget (`SecurityToolkit.tsx:357-366`) also does PBKDF2 but with only 10,000 iterations (1990s-era count) and mislabels its output as bcrypt format `$2a$10$...`. It was kept during the hub refactor (not a duplicate — it does real PBKDF2), but its iteration count should also be bumped to 600,000.
