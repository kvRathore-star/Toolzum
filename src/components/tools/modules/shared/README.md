# Shared tool modules (`shared/`)

Most files here are generic converters (format hubs, document/audio/image converters) usable across categories. Three exports are load-bearing infrastructure — read this before touching them.

## `CalculatorShell` — the calculator wrapper (~200 usages)

Props (`CalculatorShellProps` in `CalculatorShell.tsx:39`):

| Prop | Required | Meaning |
|------|----------|---------|
| `title`, `children`, `result` | yes | Header title, input form, result string |
| `onCalculate` + `calculateLabel` | for manual mode | Explicit calculate button |
| `auto` | — | **Auto-calculate on input change.** Only for simple single-formula calculators. Heavy computation, interdependent fields, or destructive operations must use an explicit button. |
| `presets` | — | Quick-fill buttons (`{ label, apply }`) |
| `error` | — | Error string shown in the result panel |
| `resultStats`, `resultLabel`, `customResult` | — | Rich result rendering |
| `downloadData`, `downloadFilename` | — | Enables result download |
| `accent`, `category`, `icon` | — | Theming / analytics |

Also provides: copy-to-clipboard, 20-entry result history, keyboard shortcut for calculate. The result panel carries `aria-live`, so results are announced — do not add a second live region inside it.

## Guard pattern (read this — it has caused crash bugs)

Computation must live **inside** `if (hasInput) { ... }`, never just the display:

```tsx
// WRONG — division runs even when the ternary takes the other branch
<p>{hasInput ? (a / b).toFixed(2) : '—'}</p>

// RIGHT
let out = '';
if (hasInput) {
  out = (a / b).toFixed(2);
}
```

Inline division inside template literals executes in untaken ternary branches and produces `NaN`/crashes on empty input.

## `CalcActions` — result actions

`{ result, downloadData?, downloadFilename?, accent? }` — copy button, CSV download, collapsible 20-entry history (debounced 500ms). Use it when a tool needs result actions without the full shell.

## `Calculators.shared` (`../Calculators.shared.ts`)

`inputCls` / `labelCls` — the canonical input + label styling. Use them instead of hand-rolled classes so all tools look and focus identically.

## Accessibility helpers (`src/components/`)

- `useDialogA11y(active, onClose, { lockScroll?, trap? })` — initial focus, Tab-wrap trap, Escape to close, body scroll lock, focus restore. Use for every modal dialog.
- `buttonKeyHandlers` — prefer the named helpers: `onKeyDown={(e) => buttonKeyDown(e, fn)}` + `onKeyUp={(e) => buttonKeyUp(e, fn)}` (Enter fires on keydown, Space on keyup with scroll-prevent). Keep the attributes **literal** — `jsx-a11y` cannot see through `{...spread}` and will still fail the lint gate.
- Non-modal notices (cookie banner, toasts) use `role="region"`, never `role="dialog"`.
