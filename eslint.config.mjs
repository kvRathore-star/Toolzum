import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Demoted to warning: broad style rules that would otherwise block CI on
      // legacy code written before they were introduced. Visible, not fatal.
      // (set-state-in-effect is intentionally LEFT as an error pending review —
      // it flags real cascading-render anti-patterns, not style noise.)
      "@typescript-eslint/no-explicit-any": "warn",
      // jsx-a11y interaction rules are errors: the 2026-09 a11y pass fixed
      // every onClick-without-keyboard site repo-wide (labels, focus traps,
      // dropzones, canvas, table rows, admin overlays). New violations block CI.
      // Anchor rules audited 2026-09-10: zero violations repo-wide, now errors.
      // Label rule stays warn-only: 1,148 sites across 385 files need
      // bound-identity naming review first (batch-flipping would break CI).
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",
      "react/no-unescaped-entities": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  {
    // Routing is single-source: MODULE_REGISTRY in DynamicModuleWrapper.tsx is
    // the ONLY sanctioned importer of tool module components. A parallel
    // registration path (the historical converterConfig.ts + ConverterRouter.tsx
    // shape) is blocked at authoring time by refusing direct module imports from
    // anywhere else in src. Register new tools in MODULE_REGISTRY instead.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/tools/modules/**", "src/__tests__/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/tools/modules/**", "!@/components/tools/modules/DynamicModuleWrapper"],
              message:
                "Tool module components are reachable only through MODULE_REGISTRY in DynamicModuleWrapper.tsx. Register the slug there — do not import a module component directly (this is how a second registration path starts).",
            },
          ],
        },
      ],
    },
  },
  {
    // Node scripts are CommonJS — require() is correct there, not a bug.
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated android app bundles should never have been linted.
    "android/**",
  ]),
]);

export default eslintConfig;
 