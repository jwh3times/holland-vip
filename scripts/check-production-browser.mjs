import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCTION_SITE_URL = "https://holland.vip/";
const ANALYTICS_SCRIPT_URL = "https://static.cloudflareinsights.com/beacon.min.js";
const RUM_PATH = "/cdn-cgi/rum";

function formatEntries(entries) {
  return entries.map((entry) => JSON.stringify(entry)).join("\n");
}

/** Verifies the browser observations collected from the deployed portfolio. */
export function assertProductionBrowserResult(result) {
  if (result.status !== 200) {
    throw new Error(`Homepage expected HTTP 200, received ${result.status ?? "no response"}`);
  }

  if (result.analyticsScripts.length !== 1) {
    throw new Error(
      `Expected exactly one Cloudflare Web Analytics script, found ${result.analyticsScripts.length}:\n${formatEntries(result.analyticsScripts)}`
    );
  }

  const [analyticsScript] = result.analyticsScripts;
  if (analyticsScript.src !== ANALYTICS_SCRIPT_URL || analyticsScript.nextStrategy !== null) {
    throw new Error(
      `Expected the sole Analytics script to be injected by Cloudflare, received ${JSON.stringify(analyticsScript)}`
    );
  }

  const successfulRumResponses = result.rumResponses.filter(
    ({ method, status, url }) =>
      method === "POST" && status >= 200 && status < 300 && new URL(url).pathname === RUM_PATH
  );
  if (successfulRumResponses.length === 0) {
    throw new Error(
      `Expected a successful Cloudflare RUM submission, received:\n${formatEntries(result.rumResponses)}`
    );
  }

  if (result.consoleErrors.length > 0) {
    throw new Error(`Production browser logged errors:\n${formatEntries(result.consoleErrors)}`);
  }
  if (result.pageErrors.length > 0) {
    throw new Error(`Production page raised errors:\n${formatEntries(result.pageErrors)}`);
  }
  if (result.failedRequests.length > 0) {
    throw new Error(`Production requests failed:\n${formatEntries(result.failedRequests)}`);
  }
}

/** Opens the deployed site in Chromium and verifies its edge-injected browser contract. */
export async function runProductionBrowserSmoke({
  siteUrl = PRODUCTION_SITE_URL,
  browserType = chromium,
  logger = console.log,
  settleDelayMs = 3_000,
} = {}) {
  const browser = await browserType.launch({ headless: true });

  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    const rumResponses = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push({ text: message.text() });
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push({ message: error.message });
    });
    page.on("requestfailed", (request) => {
      failedRequests.push({
        error: request.failure()?.errorText ?? "unknown failure",
        method: request.method(),
        url: request.url(),
      });
    });
    page.on("response", (response) => {
      const request = response.request();
      if (new URL(response.url()).pathname === RUM_PATH) {
        rumResponses.push({
          method: request.method(),
          status: response.status(),
          url: response.url(),
        });
      }
    });

    const response = await page.goto(new URL(siteUrl).href, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });
    await page.waitForTimeout(settleDelayMs);

    const analyticsScripts = await page
      .locator(`script[src="${ANALYTICS_SCRIPT_URL}"]`)
      .evaluateAll((scripts) =>
        scripts.map((script) => ({
          nextStrategy: script.getAttribute("data-nscript"),
          src: script.src,
        }))
      );

    const result = {
      analyticsScripts,
      consoleErrors,
      failedRequests,
      pageErrors,
      rumResponses,
      status: response?.status() ?? null,
    };
    assertProductionBrowserResult(result);
    logger("Production browser, CSP, and Cloudflare Web Analytics contract OK");
    return result;
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    await runProductionBrowserSmoke({ siteUrl: process.argv[2] });
    console.log("Production browser smoke check passed.");
  } catch (error) {
    console.error(`::error::${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
