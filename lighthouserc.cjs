const { chromium } = require("@playwright/test");

module.exports = {
  ci: {
    collect: {
      staticDistDir: "./out",
      url: ["http://localhost/"],
      numberOfRuns: 5,
      chromePath: chromium.executablePath(),
      puppeteerScript: "./scripts/lighthouse-puppeteer.cjs",
    },
    assert: {
      assertions: {
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
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
    },
  },
};
