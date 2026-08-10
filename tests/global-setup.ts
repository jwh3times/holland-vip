import type { FullConfig } from "@playwright/test";

import { siteConfig } from "../lib/site-config";

/**
 * Confirms that whatever is serving `baseURL` is actually this site.
 *
 * `playwright.config.ts` sets `reuseExistingServer` locally, which is what makes
 * iteration fast — but it accepts *any* server already listening on the port,
 * without checking what it is. Port 3000 is the Next.js default, so a second
 * project's dev server silently becomes the system under test. When that
 * happened here, 20 of 72 tests failed with assertions that read like a
 * regression in this repo ("should display all main sections", "should have
 * Open Graph tags") and nothing in the output mentioned the port.
 *
 * A false *pass* is possible the same way: an assertion that happens to hold on
 * the other site — a title regex, a `toBeVisible` on a common selector — would
 * go green against the wrong app.
 *
 * This runs before the suite and turns that into one actionable line.
 *
 * Ordering note: Playwright may start `webServer` before or after `globalSetup`
 * depending on version, so this deliberately does not require a server to be up.
 * Nothing listening is fine — Playwright will start ours. The only case it
 * rejects is a server that answers and isn't us, which is exactly the reuse case.
 */

/** Signals that identify this site in the served HTML. Both must be present. */
const IDENTITY = [
  { label: `og:url of ${siteConfig.url}`, pattern: `content="${siteConfig.url}"` },
  { label: `"${siteConfig.name}" in the title`, pattern: siteConfig.name },
];

const PROBE_TIMEOUT_MS = 3000;

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) return;

  let html: string;
  try {
    const res = await fetch(baseURL, { signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    html = await res.text();
  } catch {
    // Nothing is listening yet (or it didn't answer in time). Playwright's
    // `webServer` will start the right one — there is no foreign server to warn
    // about, so let the run proceed.
    return;
  }

  const missing = IDENTITY.filter(({ pattern }) => !html.includes(pattern));
  if (missing.length === 0) return;

  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? "(no <title>)";

  throw new Error(
    [
      "",
      `A server is already running on ${baseURL}, but it is not this site.`,
      "",
      `  Its <title> is: ${title}`,
      `  Missing: ${missing.map((m) => m.label).join(", ")}`,
      "",
      "Playwright reuses an existing server locally, so the whole suite would have",
      "run against that app and reported failures as if they were bugs in this repo.",
      "",
      "Fix: stop whatever is on that port, then re-run. To check what holds it:",
      "  Windows  netstat -ano | findstr :3000",
      "  macOS    lsof -i :3000",
      "",
    ].join("\n")
  );
}
