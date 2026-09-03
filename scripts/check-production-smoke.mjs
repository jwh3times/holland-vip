import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCTION_SITE_URL = "https://holland.vip/";
const PRODUCTION_WWW_URL = "https://www.holland.vip/";

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

async function requirePage(fetchImpl, url, label, expectedText) {
  const response = await fetchImpl(url, { redirect: "follow" });
  requireStatus(response, 200, label);
  const body = await response.text();
  requireText(body, expectedText, label);
  return response;
}

/** Verifies the user-visible HTTP contract served by the production portfolio. */
export async function runProductionSmoke({
  siteUrl = PRODUCTION_SITE_URL,
  wwwUrl = PRODUCTION_WWW_URL,
  fetchImpl = fetch,
  logger = console.log,
  maxAttempts = 3,
  retryDelay = () => new Promise((resolve) => setTimeout(resolve, 5_000)),
} = {}) {
  const canonicalUrl = new URL(siteUrl).href;
  const request = (url, init) => fetchWithRetry(fetchImpl, url, init, maxAttempts, retryDelay);

  const homepage = await requirePage(request, canonicalUrl, "Homepage", "Jerry Holland");
  const expectedHeaders = [
    ["content-security-policy", ["default-src 'self'", "frame-ancestors 'self'"]],
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
  logger("Homepage content and complete security-header contract OK");

  const robots = await requirePage(
    request,
    urlAt(canonicalUrl, "/robots.txt"),
    "robots.txt",
    "Sitemap: https://holland.vip/sitemap.xml"
  );
  requireContentType(robots, "text/plain", "robots.txt");
  logger("robots.txt OK");

  const sitemap = await requirePage(
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

  const security = await requirePage(
    request,
    urlAt(canonicalUrl, "/.well-known/security.txt"),
    "security.txt",
    "Canonical: https://holland.vip/.well-known/security.txt"
  );
  requireContentType(security, "text/plain", "security.txt");
  logger("security.txt OK");

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
