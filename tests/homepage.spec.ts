import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the homepage with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Jerry Holland/);
  });

  test("should display the hero section with name", async ({ page }) => {
    const heroName = page.locator("h1");
    await expect(heroName).toContainText("Jerry Holland");
  });

  test("should display all main sections", async ({ page }) => {
    // Check for all section headings
    await expect(page.locator("#about")).toBeVisible();
    await expect(page.locator("#career")).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#impact")).toBeVisible();
    await expect(page.locator("#work")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });

    await nav.getByRole("link", { name: "contact.sh" }).click();
    await expect(page.locator("#contact")).toBeInViewport();

    // The header prompt returns to the hero.
    await page.getByRole("banner").getByRole("link", { name: /:~$/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  });

  // #about left the nav but stays a deep link, so old links still land on the Biography.
  test("lands an old #about link on the Biography", async ({ page }) => {
    await page.goto("/#about");
    const about = page.locator("section#about");
    await expect(about).toBeInViewport();
    await expect(about.getByRole("heading", { level: 2 })).toHaveText("About");
    await expect(about).toContainText("# README.md");
  });

  test("contact shows the email as a large link and the social buttons", async ({ page }) => {
    const contact = page.locator("section#contact");
    await expect(contact.getByRole("link", { name: "jerry@holland.vip" })).toHaveAttribute(
      "href",
      "mailto:jerry@holland.vip"
    );
    await expect(contact.getByRole("link", { name: "github/jwh3times" })).toBeVisible();
    await expect(contact.getByRole("link", { name: "linkedin/jerryhollandiii" })).toBeVisible();
  });

  test("closes with the status bar in place of the old footer", async ({ page }) => {
    const statusBar = page.getByRole("contentinfo");
    await expect(statusBar).toContainText("● main");
    await expect(statusBar).toContainText(`© ${new Date().getFullYear()} Holland`);
    await expect(statusBar).toContainText(/UTF-8 · LF · (dark|light)/);
  });

  test("every nav link lands on its section", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });
    for (const [label, id] of [
      ["projects/", "projects"],
      ["career.log", "career"],
      ["impact.diff", "impact"],
      ["work/", "work"],
      ["contact.sh", "contact"],
    ]) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page.locator(`section#${id}`)).toBeInViewport();
    }
  });

  test("should have external links open in new tab", async ({ page }) => {
    const githubLink = page.locator('a[href="https://github.com/jwh3times"]').first();
    await expect(githubLink).toHaveAttribute("target", "_blank");
    await expect(githubLink).toHaveAttribute("rel", /noopener/);
  });

  // Each numbered section's number is derived from its position in the ordered list
  // in app/page.tsx; no section sets its own, so the numbers always run 01, 02, … in
  // page order with no gap.
  test("numbers the body sections in page order, from 01 with no gap", async ({ page }) => {
    const numbers = await page.getByTestId("section-number").allTextContents();

    expect(numbers.length).toBeGreaterThan(1);
    expect(numbers).toEqual(numbers.map((_, i) => String(i + 1).padStart(2, "0")));
  });

  test("every header anchor resolves to a section that exists on the page", async ({ page }) => {
    const hrefs = await page
      .locator("header a[href^='#']")
      .evaluateAll((links) => Array.from(new Set(links.map((l) => l.getAttribute("href") ?? ""))));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      await expect(page.locator(`section${href}`), `no section for ${href}`).toHaveCount(1);
    }
  });
});
