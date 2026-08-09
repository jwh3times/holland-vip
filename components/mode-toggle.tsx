"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

import { cn } from "@/lib/utils";

// Hydration-safe mount detection without setState-in-effect: returns the
// server snapshot (false) during SSR + initial hydration, then true on the client.
const emptySubscribe = () => () => {};

// Shared by the placeholder and the mounted toggle so both render identical
// server/client markup apart from the icon and the interactive affordances.
const toggleBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 relative h-10 w-10";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <button type="button" className={toggleBase} disabled tabIndex={-1} aria-hidden>
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={cn(
        toggleBase,
        "rounded-full border border-transparent hover:border-blue-500/40 hover:bg-blue-500/10 dark:hover:bg-blue-500/10"
      )}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activate light mode" : "Activate dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-300 transition-transform duration-200" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600 transition-transform duration-200" />
      )}
    </button>
  );
}
