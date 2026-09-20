import { readFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCTION_SITE_URL = "https://holland.vip/";
const PRODUCTION_WWW_URL = "https://www.holland.vip/";

/**
 * `public/_headers` is the live source of truth for Cloudflare Pages, so the
 * intended CSP is read from it rather than restated here. That keeps one copy
 * of the policy and makes this check answer a sharper question: does production
 * serve exactly what the repository declares? A stale deployment or a dashboard
 * override now fails, where a second hard-coded copy would have agreed with
 * itself and missed both.
 */
const HEADERS_FILE = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "_headers");

/** Security.txt fields RFC 9116 requires us to keep answerable. */
const REQUIRED_SECURITY_FIELDS = ["contact", "canonical", "policy", "expires"];

function urlAt(siteUrl, path) {
  return new URL(path, siteUrl).href;
}

function requireStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(`${label} expected HTTP ${expected}, received ${response.status}`);
  }
}

function requireContentType(response, expected, label) {
  const actual = response.headers.get("content-type") ?? "";
  if (!actual.toLowerCase().includes(expected.toLowerCase())) {
    throw new Error(`${label} expected content-type containing ${expected}, received ${actual}`);
  }
}

function requireText(text, expected, label) {
  if (!text.includes(expected)) {
    throw new Error(`${label} did not contain ${expected}`);
  }
}

function requireHeader(response, name, expectedParts = []) {
  const value = response.headers.get(name);
  if (!value) throw new Error(`Homepage is missing security header ${name}`);
  for (const expected of expectedParts) {
    if (!value.toLowerCase().includes(expected.toLowerCase())) {
      throw new Error(`Security header ${name} did not contain ${expected}`);
    }
  }
}

/**
 * Parse a CSP into `directive -> sorted sources`.
 *
 * Directive names and the keyword/scheme/host sources are all case-insensitive
 * per the spec, so everything is lowercased; comparing sets rather than
 * substrings is the whole point of this function. Substring membership cannot
 * tell `script-src 'self'` from `script-src 'self' *`.
 */
export function parseCsp(value) {
  const directives = new Map();
  for (const segment of (value ?? "").split(";")) {
    const parts = segment.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) continue;
    const name = parts[0].toLowerCase();
    directives.set(
      name,
      parts
        .slice(1)
        .map((source) => source.toLowerCase())
        .sort()
    );
  }
  return directives;
}

/** The `Content-Security-Policy` value declared for `/*` in a `_headers` file. */
export function cspFromHeadersFile(text) {
  const match = /^\s*Content-Security-Policy:\s*(.+)$/im.exec(text);
  if (!match) throw new Error("public/_headers declares no Content-Security-Policy");
  return match[1].trim();
}

/**
 * Fail when the served CSP is not the intended policy, directive for directive.
 *
 * A widened directive is the case that matters — a response keeping
 * `default-src 'self'` while adding a wildcard `script-src` passes any
 * substring check — so added sources and unexpected directives are reported
 * separately from the merely-missing.
 */
function requireCspMatches(response, intended, label) {
  const servedValue = response.headers.get("content-security-policy");
  if (!servedValue) throw new Error(`${label} is missing security header content-security-policy`);

  const served = parseCsp(servedValue);
  const expected = parseCsp(intended);
  const problems = [];

  for (const [name, sources] of expected) {
    if (!served.has(name)) {
      problems.push(`missing directive ${name}`);
      continue;
    }
    const actual = served.get(name);
    const added = actual.filter((source) => !sources.includes(source));
    const removed = sources.filter((source) => !actual.includes(source));
    if (added.length) problems.push(`${name} widened with ${added.join(" ")}`);
    if (removed.length) problems.push(`${name} is missing ${removed.join(" ")}`);
  }

  for (const name of served.keys()) {
    if (!expected.has(name)) problems.push(`unexpected directive ${name}`);
  }

  if (problems.length) {
    throw new Error(
      `${label} Content-Security-Policy does not match public/_headers: ${problems.join("; ")}`
    );
  }
}

/** Parse `security.txt` into `field -> values`, ignoring comments and blanks. */
export function parseSecurityTxt(text) {
  const fields = new Map();
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    if (!value) continue;
    fields.set(name, [...(fields.get(name) ?? []), value]);
  }
  return fields;
}

/**
 * Check the live security.txt still answers a reporter's questions.
 *
 * The browser SEO test asserts this against the built artifact; this asserts it
 * against what production actually serves, which is a different claim. An
 * expired document is the failure mode that arrives on its own, with no deploy
 * to notice it, which is why the expiry is checked rather than just its shape.
 */
function requireSecurityTxt(text, now, label) {
  const fields = parseSecurityTxt(text);

  const missing = REQUIRED_SECURITY_FIELDS.filter((name) => !fields.has(name));
  if (missing.length) throw new Error(`${label} is missing ${missing.join(", ")}`);

  const expires = new Date(fields.get("expires")[0]);
  if (Number.isNaN(expires.getTime())) {
    throw new Error(`${label} has an unparseable Expires: ${fields.get("expires")[0]}`);
  }
  if (expires.getTime() <= now.getTime()) {
    throw new Error(`${label} expired at ${expires.toISOString()}`);
  }
}

async function fetchWithRetry(fetchImpl, url, init, maxAttempts, retryDelay) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, init);
      if (response.status < 500 || attempt === maxAttempts) return response;
      lastError = new Error(`${url} responded ${response.status}`);
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) throw error;
    }
    await retryDelay();
  }
  throw lastError;
}

/** Returns the response *and* its body: a Response body can only be read once. */
async function requirePage(fetchImpl, url, label, expectedText) {
  const response = await fetchImpl(url, { redirect: "follow" });
  requireStatus(response, 200, label);
  const body = await response.text();
  requireText(body, expectedText, label);
  return { response, body };
}

/** Verifies the user-visible HTTP contract served by the production portfolio. */
export async function runProductionSmoke({
  siteUrl = PRODUCTION_SITE_URL,
  wwwUrl = PRODUCTION_WWW_URL,
  fetchImpl = fetch,
  logger = console.log,
  maxAttempts = 3,
  retryDelay = () => new Promise((resolve) => setTimeout(resolve, 5_000)),
  expectedCsp = cspFromHeadersFile(readFileSync(HEADERS_FILE, "utf8")),
  now = new Date(),
} = {}) {
  const canonicalUrl = new URL(siteUrl).href;
  const request = (url, init) => fetchWithRetry(fetchImpl, url, init, maxAttempts, retryDelay);

  const { response: homepage } = await requirePage(
    request,
    canonicalUrl,
    "Homepage",
    "Jerry Holland"
  );
  requireCspMatches(homepage, expectedCsp, "Homepage");
  const expectedHeaders = [
    ["strict-transport-security", ["max-age=31536000", "includeSubDomains"]],
    ["x-content-type-options", ["nosniff"]],
    ["x-frame-options", ["SAMEORIGIN"]],
    ["x-dns-prefetch-control", ["on"]],
    ["referrer-policy", ["strict-origin-when-cross-origin"]],
    ["permissions-policy", ["camera=()", "microphone=()", "geolocation=()"]],
  ];
  for (const [name, expectedParts] of expectedHeaders) {
    requireHeader(homepage, name, expectedParts);
  }
  logger("Homepage content, exact CSP match, and security-header contract OK");

  const { response: robots } = await requirePage(
    request,
    urlAt(canonicalUrl, "/robots.txt"),
    "robots.txt",
    "Sitemap: https://holland.vip/sitemap.xml"
  );
  requireContentType(robots, "text/plain", "robots.txt");
  logger("robots.txt OK");

  const { response: sitemap } = await requirePage(
    request,
    urlAt(canonicalUrl, "/sitemap.xml"),
    "sitemap.xml",
    "<loc>https://holland.vip/</loc>"
  );
  requireContentType(sitemap, "xml", "sitemap.xml");
  logger("sitemap.xml OK");

  const manifest = await request(urlAt(canonicalUrl, "/manifest.json"), {
    redirect: "follow",
  });
  requireStatus(manifest, 200, "manifest.json");
  requireContentType(manifest, "json", "manifest.json");
  let manifestBody;
  try {
    manifestBody = await manifest.json();
  } catch {
    throw new Error("manifest.json did not contain valid JSON");
  }
  if (manifestBody?.name !== "Jerry Holland | Senior Software Engineer") {
    throw new Error("manifest.json did not contain the expected portfolio name");
  }
  logger("manifest.json OK");

  const openGraphImage = await request(urlAt(canonicalUrl, "/og-image.png"), {
    redirect: "follow",
  });
  requireStatus(openGraphImage, 200, "Open Graph image");
  requireContentType(openGraphImage, "image/png", "Open Graph image");
  if ((await openGraphImage.arrayBuffer()).byteLength === 0) {
    throw new Error("Open Graph image was empty");
  }
  logger("Open Graph image OK");

  const { response: security, body: securityBody } = await requirePage(
    request,
    urlAt(canonicalUrl, "/.well-known/security.txt"),
    "security.txt",
    "Canonical: https://holland.vip/.well-known/security.txt"
  );
  requireContentType(security, "text/plain", "security.txt");
  requireSecurityTxt(securityBody, now, "security.txt");
  logger("security.txt contact, policy, canonical, and expiry OK");

  const notFound = await request(urlAt(canonicalUrl, "/__production-smoke-not-found__"), {
    redirect: "manual",
  });
  requireStatus(notFound, 404, "Unknown route");
  logger("404 behavior OK");

  const redirect = await request(new URL(wwwUrl).href, { redirect: "manual" });
  if (![301, 302, 307, 308].includes(redirect.status)) {
    throw new Error(`www redirect expected a redirect response, received ${redirect.status}`);
  }
  const location = redirect.headers.get("location");
  if (location !== canonicalUrl) {
    throw new Error(
      `www redirect expected location ${canonicalUrl}, received ${location ?? "none"}`
    );
  }
  logger("www-to-apex redirect OK");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    await runProductionSmoke({ siteUrl: process.argv[2], wwwUrl: process.argv[3] });
    console.log("Production smoke check passed.");
  } catch (error) {
    console.error(`::error::${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
