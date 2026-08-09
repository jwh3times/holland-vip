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
    await expect(page.locator("#skills")).toBeVisible();
    await expect(page.locator("#experience")).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
  });

  test("should have working navigation links", async ({ page, isMobile }) => {
    // On mobile, open the hamburger menu first
    if (isMobile) {
      const menuButton = page.locator('button[aria-label="Open menu"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }
    }

    // Click on About link (use visible link) and verify scroll
    await page.locator('nav a[href="#about"]:visible').first().click();
    await expect(page.locator("#about")).toBeInViewport();

    // On mobile, reopen menu for next link
    if (isMobile) {
      const menuButton = page.locator('button[aria-label="Open menu"]');
      if (await menuButton.isVisible()) {
        await menuButton.click();
      }
    }

    // Click on Contact link and verify scroll
    await page.locator('nav a[href="#contact"]:visible').first().click();
    await expect(page.locator("#contact")).toBeInViewport();
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

  // The surface each section renders on is derived from its position in the ordered
  // list in app/page.tsx. Before that, each section hard-coded its own class and two
  // adjacent ones (open-source and education) collided with nothing to catch it.
  test("alternates section surfaces, with no two adjacent sections matching", async ({ page }) => {
    const backgrounds = await page
      .locator("main > section:not(.hero-section)")
      .evaluateAll((sections) => sections.map((s) => getComputedStyle(s).backgroundColor));

    expect(backgrounds.length).toBeGreaterThan(1);
    for (let i = 0; i < backgrounds.length - 1; i++) {
      expect(
        backgrounds[i],
        `sections ${i} and ${i + 1} share a background (${backgrounds[i]})`
      ).not.toBe(backgrounds[i + 1]);
    }
  });

  test("every nav anchor resolves to a section that exists on the page", async ({ page }) => {
    const hrefs = await page
      .locator("nav a[href^='#']")
      .evaluateAll((links) => Array.from(new Set(links.map((l) => l.getAttribute("href") ?? ""))));

    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      await expect(page.locator(`section${href}`), `no section for ${href}`).toHaveCount(1);
    }
  });
});
