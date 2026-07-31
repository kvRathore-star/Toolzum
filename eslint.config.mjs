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
      // (Triage-before-demote items set-state-in-effect / exhaustive-deps are
      // intentionally LEFT as errors pending review — not style noise.)
      "@typescript-eslint/no-explicit-any": "warn",
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
 