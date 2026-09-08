# Contributing to Toolzum

## Setup

```bash
npm install
npm run dev        # http://localhost:3000
```

Copy `.env.example` to `.env.local` for auth/payments/analytics keys. Most tools work without any env vars (they run client-side).

## Adding a tool

1. Build the component under `src/components/tools/modules/<category>/`.
2. Register the slug in `DynamicModuleWrapper.tsx` (`MODULE_REGISTRY`) — this is the **only** sanctioned import path (enforced by `no-restricted-imports` in `eslint.config.mjs`).
3. Add metadata to the registry chunks consumed by `src/registry/tools-index.ts`.
4. Run the generators (`npm run build` covers them) so sitemap/OG/slugs update.

## Conventions (enforced in review + CI)

- **Styling inputs:** use `inputCls` / `labelCls` from `src/components/tools/modules/Calculators.shared`. Theme with CSS vars (`var(--accent)`, `var(--bg-surface)`, `var(--text-primary)`) — never hardcoded Tailwind palette colors.
- **Guard pattern:** computation must live inside `if (hasInput) { ... }`, not just the display. Inline division inside template literals executes even in untaken ternary branches — this has caused real crash bugs.
- **Auto-calculate:** the `auto` prop is for simple single-formula calculators only. Use an explicit button for heavy computation, interdependent fields, or destructive operations.
- **Labels:** every form control needs an accessible name — `htmlFor`/`id`, a wrapping `<label>`, or `aria-label`. Shared `Input` components already associate via `useId`; don't re-label them.
- **Interactive elements:** `onClick` on a non-native element requires keyboard support (`buttonKeyHandlers` in `src/components/buttonKeys.ts`) plus `role` and `tabIndex`. `jsx-a11y` interaction rules are CI errors.
- **Dialogs:** use `useDialogA11y` (focus trap, Escape, scroll lock, focus restore). Non-modal notices use `role="region"`, not `role="dialog"`.
- **Category icons:** canonical definitions live in `src/lib/categoryTheme.ts`; megamenu icons (`src/registry/megamenu-icons.ts`) must match.

## Checks before pushing

```bash
npx eslint <touched-files>   # full-repo lint times out locally; CI runs it all
npm test                     # vitest; update/add tests with behavior changes
```

CI runs lint → typecheck → test → build, plus `npm audit` blocking at critical. Husky pre-push runs the same gate — a red gate blocks the push.

## What not to do

- Don't import tool modules directly anywhere except `MODULE_REGISTRY`.
- Don't add `unsafe-*` CSP entries or weaken headers without documenting the rationale inline (see `public/_headers`).
- Don't commit generated output (`out/`, `.next/`); do commit registry/generator *inputs*.
- Don't touch `docs/TODO-TRACKER.md` unless it's yours — check `git status` for pre-existing dirt before starting.
