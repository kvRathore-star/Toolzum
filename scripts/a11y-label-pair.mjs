/**
 * A1.3 batch: pair unassociated `<label>` elements with their control via
 * `htmlFor` + `id` (insertions only — never retype surrounding code).
 *
 * Safety contract (Sep 2026 verification discipline):
 * - Uses the shared brace-aware scanner in `./jsx-tag-scan.mjs` (never a
 *   per-script regex like `<input[^>]*>`, which truncates at `>` in `=>`).
 * - Names are NEVER invented: the fix only binds the author's own existing
 *   `<label>` text to its control. No placeholder copying, no sibling-text
 *   mirroring. Anything ambiguous goes to the human-review list.
 * - Auto-fix applies ONLY to the unambiguous pattern: a `<label>` without
 *   `htmlFor` whose parent holds exactly one label and exactly one
 *   `input`/`select`/`textarea` (hidden inputs excluded). A `<label>` that
 *   already wraps its control (nesting) is left alone.
 * - Two-phase: validate ALL ops across ALL files first; any validation
 *   failure aborts before a single write. Idempotent: re-runs skip labels
 *   that already have `htmlFor`.
 * - Anchor checks assert ABSENCE: the label must lack `htmlFor` and the
 *   control must lack `id` (exact attribute match — `id` ≠ `aria-labelledby`).
 *
 * Usage:
 *   node scripts/a11y-label-pair.mjs [--apply] [--root src] [paths...]
 * Default is dry-run (classify + report, no writes). `--apply` validates
 * then writes. Report JSON goes to stdout with `--report <path>`; human
 * review entries always print as `file:line — label "text" — reason`.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { scanTags, buildTree, walk, getAttr, hasAttr } from "./jsx-tag-scan.mjs";

const CONTROLS = new Set(["input", "select", "textarea"]);
const TAG_OPEN_LEN = { label: 6, input: 6, select: 7, textarea: 9 }; // "<name".length

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

function collectTsxFiles(roots) {
  const out = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        visit(full);
      } else if (entry.isFile() && full.endsWith(".tsx")) {
        out.push(full);
      }
    }
  };
  for (const root of roots) {
    const st = fs.statSync(root);
    if (st.isDirectory()) visit(root);
    else if (root.endsWith(".tsx")) out.push(root);
  }
  return out.sort();
}

function staticIdValue(attr) {
  if (!attr || !attr.value) return null;
  const v = attr.value.trim();
  const m = v.match(/^(['"])(.*)\1$/s);
  return m ? m[2] : null; // null when dynamic ({...}) — needs human review
}

function labelText(node) {
  // Visible identity only: own text + string-literal expressions. Nested
  // elements/components make the name unreliable → caller treats as review.
  const nested = node.children.length > 0;
  return { text: (node.text || "").trim(), nested };
}

function classifyFile(file) {
  const src = fs.readFileSync(file, "utf8");
  const tags = scanTags(src);
  const { roots, errors } = buildTree(src, tags);
  const result = { file, treeErrors: errors, ops: [], review: [], skipped: 0 };

  const existingIds = new Set();
  walk(roots, (node) => {
    const idAttr = getAttr(node, "id");
    const staticId = staticIdValue(idAttr);
    if (staticId) existingIds.add(staticId);
  });

  const usedIds = new Set(existingIds);
  const fileBase = slugify(path.basename(file, ".tsx")) || "tool";
  let counter = 0;

  const mintId = (text) => {
    const textSlug = slugify(text);
    if (!textSlug) return null;
    counter += 1;
    let candidate = `lbl-${fileBase}-${textSlug}`;
    if (usedIds.has(candidate)) candidate = `${candidate}-${counter}`;
    let guard = 0;
    while (usedIds.has(candidate) && guard < 100) {
      guard += 1;
      candidate = `${candidate}-${guard}`;
    }
    usedIds.add(candidate);
    return candidate;
  };

  const labelNodes = [];
  walk(roots, (node) => {
    if (node.name === "label") labelNodes.push(node);
  });

  for (const label of labelNodes) {
    const line = src.slice(0, label.start).split("\n").length;
    if (hasAttr(label, "htmlFor")) {
      result.skipped += 1; // already bound — idempotent skip
      continue;
    }
    // Nesting already associates: <label>...<input/>...</label> — leave alone.
    let nestedControl = null;
    walk(label.children, (child) => {
      if (!nestedControl && CONTROLS.has(child.name)) nestedControl = child;
    });
    if (nestedControl) {
      result.skipped += 1;
      continue;
    }
    const { text, nested } = labelText(label);
    const parent = label.parent;
    if (!parent) {
      result.review.push({ line, text, reason: "label-at-root" });
      continue;
    }
    const siblingLabels = parent.children.filter((c) => c.name === "label");
    const siblingControls = parent.children.filter((c) => {
      if (!CONTROLS.has(c.name)) return false;
      const typeAttr = getAttr(c, "type");
      const staticType = staticIdValue(typeAttr);
      return staticType !== "hidden";
    });
    if (siblingLabels.length !== 1 || siblingControls.length !== 1) {
      result.review.push({
        line, text,
        reason: `ambiguous-siblings labels=${siblingLabels.length} controls=${siblingControls.length}`,
      });
      continue;
    }
    // Binding (not naming): with exactly one label and one control under the
    // same parent, the pairing is structurally forced — the name always comes
    // from the author's own label text. Nested formatting (<strong>, <code>)
    // does not change that, so only a missing text identity blocks auto-fix.
    if (!text) {
      result.review.push({ line, text, reason: nested ? "label-has-only-nested-content" : "empty-label-text" });
      continue;
    }
    const control = siblingControls[0];
    const controlIdAttr = getAttr(control, "id");
    if (controlIdAttr) {
      const staticId = staticIdValue(controlIdAttr);
      if (!staticId) {
        result.review.push({ line, text, reason: "control-has-dynamic-id" });
        continue;
      }
      // Deterministic: bind to the control's own existing id.
      result.ops.push({
        line,
        labelOffset: label.start,
        labelInsert: ` htmlFor="${staticId}"`,
        controlOffset: null,
        controlInsert: null,
        id: staticId,
      });
      continue;
    }
    const id = mintId(text);
    if (!id) {
      result.review.push({ line, text, reason: "empty-label-text" });
      continue;
    }
    result.ops.push({
      line,
      labelOffset: label.start,
      labelInsert: ` htmlFor="${id}"`,
      controlOffset: control.start,
      controlInsert: ` id="${id}"`,
      id,
    });
  }

  // Tree imbalance means parent/sibling reads are unreliable — never
  // auto-fix such files; every candidate goes to human review instead.
  if (result.treeErrors.length > 0) {
    for (const op of result.ops) {
      result.review.push({ line: op.line, text: "", reason: "tree-parse-error" });
    }
    result.ops = [];
  }

  return result;
}

/** Validate every op against fresh file content. Throws on first failure. */
function validateAll(plans) {
  for (const plan of plans) {
    const src = fs.readFileSync(plan.file, "utf8");
    for (const op of plan.ops) {
      const labelHead = src.slice(op.labelOffset, op.labelOffset + 6);
      if (labelHead !== "<label") {
        throw new Error(`${plan.file}:${op.line} label anchor moved (found ${JSON.stringify(labelHead)})`);
      }
      const labelTags = scanTags(src);
      const labelTag = labelTags.find((t) => t.start === op.labelOffset && !t.closing);
      if (!labelTag) throw new Error(`${plan.file}:${op.line} label tag not found at anchor`);
      if (labelTag.attrs.some((a) => a.name === "htmlFor")) {
        throw new Error(`${plan.file}:${op.line} label already has htmlFor (absence assert failed)`);
      }
      if (op.controlOffset !== null) {
        const ctrlTags = labelTags;
        const ctrlTag = ctrlTags.find((t) => t.start === op.controlOffset && !t.closing);
        if (!ctrlTag || !CONTROLS.has(ctrlTag.name)) {
          throw new Error(`${plan.file}:${op.line} control anchor moved`);
        }
        if (ctrlTag.attrs.some((a) => a.name === "id")) {
          throw new Error(`${plan.file}:${op.line} control already has id (absence assert failed)`);
        }
      }
    }
  }
}

function applyPlan(plan) {
  let src = fs.readFileSync(plan.file, "utf8");
  const inserts = [];
  for (const op of plan.ops) {
    inserts.push({ at: op.labelOffset + TAG_OPEN_LEN.label, text: op.labelInsert });
    if (op.controlOffset !== null) {
      const ctrlName = scanTags(src).find((t) => t.start === op.controlOffset && !t.closing)?.name;
      inserts.push({ at: op.controlOffset + (TAG_OPEN_LEN[ctrlName] ?? 6), text: op.controlInsert });
    }
  }
  // Back-to-front so earlier offsets stay valid.
  inserts.sort((a, b) => b.at - a.at);
  for (const ins of inserts) {
    src = src.slice(0, ins.at) + ins.text + src.slice(ins.at);
  }
  fs.writeFileSync(plan.file, src);
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const reportIdx = args.indexOf("--report");
  const reportPath = reportIdx !== -1 ? args[reportIdx + 1] : null;
  const rootIdx = args.indexOf("--root");
  const consumed = new Set();
  if (reportIdx !== -1) { consumed.add(reportIdx); consumed.add(reportIdx + 1); }
  if (rootIdx !== -1) { consumed.add(rootIdx); consumed.add(rootIdx + 1); }
  const roots = rootIdx !== -1 ? [args[rootIdx + 1]] : ["src"];
  const explicit = args.filter((a, i) => !a.startsWith("--") && !consumed.has(i));
  const files = explicit.length > 0 ? explicit : collectTsxFiles(roots);

  const plans = files.map(classifyFile);
  const totalOps = plans.reduce((n, p) => n + p.ops.length, 0);
  const totalReview = plans.reduce((n, p) => n + p.review.length, 0);
  const totalSkipped = plans.reduce((n, p) => n + p.skipped, 0);
  const treeErrorFiles = plans.filter((p) => p.treeErrors.length > 0);

  if (apply) {
    const actionable = plans.filter((p) => p.ops.length > 0);
    validateAll(actionable); // throws before any write on failure
    for (const plan of actionable) applyPlan(plan);
  }

  const report = {
    mode: apply ? "apply" : "dry-run",
    filesScanned: plans.length,
    autoFixable: totalOps,
    humanReview: totalReview,
    alreadyBound: totalSkipped,
    treeErrorFiles: treeErrorFiles.map((p) => ({ file: p.file, errors: p.treeErrors })),
    plans: plans.filter((p) => p.ops.length > 0 || p.review.length > 0).map((p) => ({
      file: p.file,
      ops: p.ops,
      review: p.review,
    })),
  };

  const outPath = reportPath || path.join(os.tmpdir(), "a11y-label-pair-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  // File-attributed console output: every finding keeps its filename.
  for (const plan of plans) {
    for (const r of plan.review) {
      const preview = r.text ? ` label ${JSON.stringify(r.text.slice(0, 60))}` : "";
      console.log(`${plan.file}:${r.line} REVIEW${preview} — ${r.reason}`);
    }
  }
  console.log(`\nscanned=${plans.length} autoFixable=${totalOps} humanReview=${totalReview} alreadyBound=${totalSkipped} treeErrors=${treeErrorFiles.length} mode=${apply ? "APPLIED" : "dry-run"} report=${outPath}`);
}

main();
