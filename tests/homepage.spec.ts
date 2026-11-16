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
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });

    await nav.getByRole("link", { name: "about.md" }).click();
    await expect(page.locator("#about")).toBeInViewport();

    await nav.getByRole("link", { name: "contact.sh" }).click();
    await expect(page.locator("#contact")).toBeInViewport();

    // The header prompt returns to the hero.
    await page.getByRole("banner").getByRole("link", { name: /:~$/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  });

  test("should have a working email link in contact section", async ({ page }) => {
    const emailLink = page.locator('a[href="mailto:jerry@holland.vip"]');
    await expect(emailLink).toBeVisible();
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
