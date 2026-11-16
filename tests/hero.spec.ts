import { test, expect } from "@playwright/test";

// The script's last line, and the start of the static summary, from content/hero.ts.
const LAST_LINE = "and piloting Claude Code + spec-driven dev.";
const SUMMARY = /^Terminal session\. Jerry Holland/;

test.describe("Hero", () => {
  // The served document, before any script runs. (The app-wide loading boundary keeps the
  // prerendered page in a hidden block until React reveals it, so this reads the HTML itself.)
  test("puts the h1 and stats in the static HTML", async ({ request }) => {
    const html = await (await request.get("/")).text();

    expect(html).toMatch(/<h1[^>]*>Jerry Holland</);
    expect(html).toMatch(/>\d+<span[^>]*>y<\/span>/);
    expect(html).toContain(">contributions / 12mo<");
    expect(html).toContain(">contributions / 30d<");
  });

  test("shows the full script at once under reduced motion, with a static summary", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // No waiting on typing: the whole script is there as soon as the page hydrates.
    await expect(page.getByTestId("terminal-output")).toContainText(LAST_LINE, { timeout: 2000 });
    await expect(page.getByTestId("hero-terminal")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("section#top").getByText(SUMMARY)).toBeAttached();
    await expect(page.locator("section#top")).toMatchAriaSnapshot(`
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
      if (message.type() === "error" && /hydrat|#418|#423|#425/i.test(message.text())) {
        problems.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      if (/hydrat|#418|#423|#425/i.test(error.message)) problems.push(error.message);
    });

    await page.goto("/");
    await expect(page.getByTestId("terminal-clock")).toHaveText(/\d{2}:\d{2}:\d{2}/);
    expect(problems).toEqual([]);
  });
});
