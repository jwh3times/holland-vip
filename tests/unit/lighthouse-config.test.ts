import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

type Assertion = [
  "error",
  {
    minScore?: number;
    maxNumericValue?: number;
    aggregationMethod: "median-run";
  },
];

interface LighthouseConfig {
  ci: {
    collect: {
      staticDistDir: string;
      url: string[];
      numberOfRuns: number;
      chromePath: string;
      puppeteerScript: string;
      puppeteerLaunchOptions: { args: string[] };
    };
    assert: { assertions: Record<string, Assertion> };
    upload: { target: string; outputDir: string };
  };
}

describe("Lighthouse CI budget", () => {
  it("measures the static export with stable budgets through an advisory CI job", () => {
    const config = require("../../lighthouserc.cjs") as LighthouseConfig;
    const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const workflow = readFileSync(resolve(".github/workflows/ci.yml"), "utf8");

    expect(packageJson.scripts["test:lighthouse"]).toBe("lhci autorun");
    expect(config.ci.collect).toMatchObject({
      staticDistDir: "./out",
      url: ["http://localhost/"],
      numberOfRuns: 5,
      puppeteerScript: "./scripts/lighthouse-puppeteer.cjs",
    });
    expect(config.ci.collect.chromePath).toContain("chromium");
    expect(config.ci.collect.puppeteerLaunchOptions.args).toEqual(
      process.env.CI ? ["--no-sandbox"] : []
    );
    expect(config.ci.assert.assertions).toMatchObject({
      "categories:performance": ["error", { minScore: 0.85, aggregationMethod: "median-run" }],
      "categories:best-practices": ["error", { minScore: 0.95, aggregationMethod: "median-run" }],
      "first-contentful-paint": [
        "error",
        { maxNumericValue: 2000, aggregationMethod: "median-run" },
      ],
      "largest-contentful-paint": [
        "error",
        { maxNumericValue: 3500, aggregationMethod: "median-run" },
      ],
      "total-blocking-time": ["error", { maxNumericValue: 300, aggregationMethod: "median-run" }],
      "cumulative-layout-shift": [
        "error",
        { maxNumericValue: 0.1, aggregationMethod: "median-run" },
      ],
    });
    expect(config.ci.upload).toEqual({
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
    });
    expect(workflow).toContain("name: Lighthouse Budget (advisory)");
    expect(workflow).toContain("continue-on-error: true");
    expect(workflow).toContain("needs: build");
    expect(workflow).toContain("npx playwright install --with-deps chromium");
    expect(workflow).toContain("npm run test:lighthouse");
    expect(workflow).toContain("name: lighthouse-report");
  });
});
