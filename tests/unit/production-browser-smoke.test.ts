import { describe, expect, it } from "vitest";
import { assertProductionBrowserResult } from "@/scripts/check-production-browser.mjs";

interface BrowserResult {
  analyticsScripts: Array<{ nextStrategy: string | null; src: string }>;
  consoleErrors: Array<{ text: string }>;
  failedRequests: Array<{ error: string; method: string; url: string }>;
  pageErrors: Array<{ message: string }>;
  rumResponses: Array<{ method: string; status: number; url: string }>;
  status: number | null;
}

function validResult(): BrowserResult {
  return {
    analyticsScripts: [
      {
        nextStrategy: null,
        src: "https://static.cloudflareinsights.com/beacon.min.js",
      },
    ],
    consoleErrors: [],
    failedRequests: [],
    pageErrors: [],
    rumResponses: [
      {
        method: "POST",
        status: 204,
        url: "https://holland.vip/cdn-cgi/rum",
      },
    ],
    status: 200,
  };
}

describe("assertProductionBrowserResult", () => {
  it("accepts one Cloudflare-managed Analytics beacon and a successful RUM submission", () => {
    expect(() => assertProductionBrowserResult(validResult())).not.toThrow();
  });

  it("rejects duplicate or manually embedded Analytics scripts", () => {
    const duplicate = validResult();
    duplicate.analyticsScripts.push({
      nextStrategy: "afterInteractive",
      src: "https://static.cloudflareinsights.com/beacon.min.js",
    });
    expect(() => assertProductionBrowserResult(duplicate)).toThrow(
      "Expected exactly one Cloudflare Web Analytics script"
    );

    const manual = validResult();
    manual.analyticsScripts[0].nextStrategy = "afterInteractive";
    expect(() => assertProductionBrowserResult(manual)).toThrow(
      "Expected the sole Analytics script to be injected by Cloudflare"
    );
  });

  it("rejects missing telemetry and browser failures", () => {
    const missingRum = validResult();
    missingRum.rumResponses = [];
    expect(() => assertProductionBrowserResult(missingRum)).toThrow(
      "Expected a successful Cloudflare RUM submission"
    );

    const consoleFailure = validResult();
    consoleFailure.consoleErrors.push({ text: "CSP blocked a script" });
    expect(() => assertProductionBrowserResult(consoleFailure)).toThrow(
      "Production browser logged errors"
    );

    const requestFailure = validResult();
    requestFailure.failedRequests.push({
      error: "net::ERR_FAILED",
      method: "GET",
      url: "https://example.invalid/script.js",
    });
    expect(() => assertProductionBrowserResult(requestFailure)).toThrow(
      "Production requests failed"
    );
  });
});
