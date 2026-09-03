import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("scheduled cross-browser workflow", () => {
  it("runs independent Firefox and WebKit checks against one static export", () => {
    const workflow = readFileSync(resolve(".github/workflows/cross-browser.yml"), "utf8");

    expect(workflow).toContain("schedule:");
    expect(workflow).toContain('cron: "17 8 * * 1"');
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/^ {2}(push|pull_request):/m);
    expect(workflow).toContain("fail-fast: false");
    expect(workflow).toContain("browser: firefox");
    expect(workflow).toContain("project: firefox");
    expect(workflow).toContain("browser: webkit");
    expect(workflow).toContain("project: webkit");
    expect(workflow).toContain("needs: build");
    expect(workflow).toContain("actions/upload-artifact@v7");
    expect(workflow).toContain("include-hidden-files: true");
    expect(workflow).toContain("actions/download-artifact@v8");
    expect(workflow).toContain("npx playwright install --with-deps ${{ matrix.browser }}");
    expect(workflow).toContain('npm run test:e2e -- --project="${{ matrix.project }}"');
    expect(workflow).toContain("playwright-report-${{ matrix.browser }}");
  });
});
