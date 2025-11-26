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
});
