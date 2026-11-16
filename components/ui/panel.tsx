import type * as React from "react";

import { cn } from "@/lib/utils";

export interface PanelProps {
  /** The header's shell command or file name, e.g. `$ git log --career --graph`. */
  title: React.ReactNode;
  /** Right-aligned header text or link, e.g. "click a company". */
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * A Terminal "window": a bordered panel whose header row reads like a shell prompt, in small
 * dim mono, above whatever the panel holds.
 */
export function Panel({ title, meta, children, className }: PanelProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-panel", className)}>
      <div className="flex flex-wrap justify-between gap-3 border-b border-line px-3.5 py-2.5 font-mono text-xs text-dim">
        <span>{title}</span>
        {meta}
      </div>
      {children}
    </div>
  );
}
