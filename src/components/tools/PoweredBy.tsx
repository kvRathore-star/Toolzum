import React from "react";
import { poweredByLibs } from "@/lib/cloudPatterns";

/**
 * Engine badges restored Oct 5 (pre-July the site showed lib mentions under
 * tool names; the July 6 UI overhaul dropped them). Derived from the
 * registry `dependencies` field — never hand-written, so they can't drift.
 * Plain text in list rows (rows are links — nested anchors are invalid);
 * linked version on the tool page itself.
 */
export function PoweredBy({
  deps,
  linked = false,
  className = "",
}: {
  deps: string;
  linked?: boolean;
  className?: string;
}) {
  const libs = poweredByLibs(deps || "");
  if (libs.length === 0) return null;
  return (
    <p className={`text-[10px] font-mono text-[var(--text-muted)] truncate ${className}`}>
      <span>Runs on </span>
      {libs.map((lib, i) => (
        <React.Fragment key={lib.label}>
          {i > 0 && <span aria-hidden="true"> · </span>}
          {linked && lib.url ? (
            <a
              href={lib.url}
              target="_blank"
              rel="noopener"
              className="hover:text-[var(--text-primary)] hover:underline"
            >
              {lib.label}
            </a>
          ) : (
            <span>{lib.label}</span>
          )}
        </React.Fragment>
      ))}
    </p>
  );
}
