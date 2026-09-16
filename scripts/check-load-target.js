/**
 * Load-test target guard (#42). Production load tests are rude and risky;
 * this refuses the apex domain unless explicitly confirmed, and requires
 * an https target (or localhost for `npx serve out` runs).
 *
 * Pure function + tested; the CLI wrapper below is the only impure part.
 */

const PROD_HOSTS = new Set(["toolzum.com", "www.toolzum.com"]);

function targetVerdict(target, env) {
  env = env || {};
  if (!target) return { ok: false, reason: "LOAD_TARGET is required (preview URL or local serve)" };
  let url;
  try {
    url = new URL(target);
  } catch {
    return { ok: false, reason: `not a URL: ${target}` };
  }
  if (url.protocol === "http:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    return { ok: false, reason: "plain http only allowed for localhost" };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, reason: `unsupported protocol: ${url.protocol}` };
  }
  if (PROD_HOSTS.has(url.hostname) && env.LOAD_CONFIRM_PROD !== "1") {
    return {
      ok: false,
      reason: "refusing production apex without LOAD_CONFIRM_PROD=1 (run against a preview deployment instead)",
    };
  }
  return { ok: true, reason: "" };
}

module.exports = { targetVerdict, PROD_HOSTS };

if (typeof process !== "undefined" && process.argv[1] && process.argv[1].endsWith("check-load-target.js")) {
  const verdict = targetVerdict(process.env.LOAD_TARGET, process.env);
  if (!verdict.ok) {
    console.error(`load target rejected: ${verdict.reason}`);
    process.exit(1);
  }
  console.log(`load target OK: ${process.env.LOAD_TARGET}`);
}
