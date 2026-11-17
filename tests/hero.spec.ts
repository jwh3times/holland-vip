import { test, expect } from "@playwright/test";

// The script's last line, and the start of the static summary, from content/hero.ts.
const LAST_LINE = "and piloting Claude Code + spec-driven dev.";
const SUMMARY = /^Terminal session\. Jerry Holland/;
// What React logs, minified or not, when the server HTML and the first client render disagree.
const HYDRATION_ERROR = /hydrat|#418|#423|#425/i;

test.describe("Hero", () => {
  // The served document, before any script runs. Reading the HTML itself also catches a Suspense
  // boundary that would ship the prerendered page as hidden content (#259).
  test("puts the h1 and stats in the static HTML", async ({ request }) => {
    const html = await (await request.get("/")).text();

    expect(html).toMatch(/<h1[^>]*>Jerry Holland</);
    expect(html).toMatch(/>\d+<span[^>]*>y<\/span>/);
    // Each count sits just before its label, and is a number, not the empty-calendar dash.
    expect(html).toMatch(/>[\d,]+<\/div><div[^>]*>contributions \/ 12mo</);
    expect(html).toMatch(/>[\d,]+<\/div><div[^>]*>contributions \/ 30d</);
  });

  test("shows the full script at once under reduced motion, with a static summary", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // No waiting on typing: the whole script is there as soon as the page hydrates.
    await expect(page.getByTestId("terminal-output")).toContainText(LAST_LINE, { timeout: 2000 });
    await expect(page.getByTestId("hero-terminal")).toHaveAttribute("aria-hidden", "true");
    await expect(page.getByText(SUMMARY)).toBeAttached();
    // In the accessibility tree, unlike the aria-hidden terminal it stands in for.
    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - paragraph: /^Terminal session\\./
    `);
  });

  test("types the script out and runs a 24-hour clock", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");

    await expect(page.getByTestId("terminal-clock")).toHaveText(/^\d{2}:\d{2}:\d{2}$/);
    await expect(page.getByTestId("terminal-output")).toContainText(LAST_LINE, { timeout: 15000 });
  });

  test("hydrates without a hydration error", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && HYDRATION_ERROR.test(message.text())) {
        problems.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      if (HYDRATION_ERROR.test(error.message)) problems.push(error.message);
    });

    await page.goto("/");
    await expect(page.getByTestId("terminal-clock")).toHaveText(/\d{2}:\d{2}:\d{2}/);
    expect(problems).toEqual([]);
  });
});
