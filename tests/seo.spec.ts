import { test, expect } from "@playwright/test";

test.describe("SEO & Metadata", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have proper meta description", async ({ page }) => {
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /Senior Software Engineer/);
  });

  test("should have Open Graph tags", async ({ page }) => {
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogType = page.locator('meta[property="og:type"]');
    const ogImage = page.locator('meta[property="og:image"]');

    await expect(ogTitle).toHaveAttribute("content", /Jerry Holland/);
    await expect(ogDescription).toHaveAttribute("content", /.+/);
    await expect(ogType).toHaveAttribute("content", "website");
    await expect(ogImage).toHaveAttribute("content", /.+/);
  });

  test("should have Twitter card tags", async ({ page }) => {
    const twitterCard = page.locator('meta[name="twitter:card"]');
    const twitterTitle = page.locator('meta[name="twitter:title"]');

    await expect(twitterCard).toHaveAttribute("content", "summary_large_image");
    await expect(twitterTitle).toHaveAttribute("content", /Jerry Holland/);
  });

  test("should have canonical viewport meta", async ({ page }) => {
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute("content", /width=device-width/);
  });

  test("should have theme-color meta tags", async ({ page }) => {
    const themeColorLight = page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: light)"]'
    );
    const themeColorDark = page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: dark)"]'
    );

    await expect(themeColorLight).toBeAttached();
    await expect(themeColorDark).toBeAttached();
  });

  test("should have manifest link", async ({ page }) => {
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute("href", "/manifest.json");
  });

  test("should have icon links", async ({ page }) => {
    const iconLink = page.locator('link[rel="icon"]');
    await expect(iconLink).toBeAttached();
  });
});
