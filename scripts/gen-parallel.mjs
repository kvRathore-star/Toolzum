#!/usr/bin/env node
/**
 * gen-parallel.mjs — run the four build generators concurrently and FAIL the
 * build if any of them fails.
 *
 * Replaces:  npm run a & npm run b & npm run c & npm run d & wait
 * Bug: a bare `wait` in that pattern returns 0 even when a child failed
 * (`bash -c 'false & true & wait'` → rc=0), so a broken OG/sitemap/redirect
 * generator could never fail `npm run build`. This waits on every child and
 * propagates the first non-zero exit code.
 */
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

export const GENERATORS = [
  "npm run gen:redirects",
  "npm run gen:og",
  "npm run gen:site-data",
  "npm run gen:download-slugs",
];

/**
 * Run commands concurrently. Resolves to a result per command; never rejects
 * (a failed child is a result, not an exception — spawn ENOENT errors count
 * as failures too).
 *
 * @param {string[]} cmds
 * @param {typeof spawn} [spawnFn] injectable for tests
 */
export function runAll(cmds, spawnFn = spawn) {
  return Promise.all(
    cmds.map(
      (cmd) =>
        new Promise((resolve) => {
          let settled = false;
          const done = (code) => {
            if (settled) return;
            settled = true;
            resolve({ cmd, code });
          };
          let child;
          try {
            child = spawnFn(cmd, { stdio: "inherit", shell: true });
          } catch (e) {
            done(1);
            return;
          }
          child.once("exit", (code) => done(code ?? 1));
          child.once("error", () => done(1));
        })
    )
  );
}

async function main() {
  const started = Date.now();
  const results = await runAll(GENERATORS);
  const failed = results.filter((r) => r.code !== 0);
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  if (failed.length > 0) {
    for (const f of failed) console.error(`gen-parallel: FAILED (${f.code}) — ${f.cmd}`);
    console.error(`gen-parallel: ${failed.length}/${results.length} generator(s) failed after ${secs}s`);
    process.exit(1);
  }
  console.log(`gen-parallel: all ${results.length} generators finished in ${secs}s`);
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main();
}
