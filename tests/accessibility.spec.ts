import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have a skip to content link", async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Skip link should be visually hidden but accessible
    await expect(skipLink).toHaveClass(/sr-only/);
  });

  test("skip link should become visible on focus", async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');

    // Focus the skip link
    await skipLink.focus();

    // Should become visible when focused
    await expect(skipLink).toHaveClass(/focus:not-sr-only/);
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    // There should be exactly one h1
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBe(1);

    // h1 should contain the name
    const h1 = page.locator("h1");
    await expect(h1).toContainText("Jerry Holland");
  });

  test("should have a main landmark", async ({ page }) => {
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();
  });

  test("should have proper link accessibility", async ({ page }) => {
    // All links should have accessible text or aria-label
    const links = page.locator("a");
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute("aria-label");

      // Each link should have either visible text or an aria-label
      const hasAccessibleName = (text && text.trim().length > 0) || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("should have proper button accessibility", async ({ page }) => {
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const ariaHidden = await button.getAttribute("aria-hidden");

      // Each button should have either visible text, an aria-label, or be marked as decorative
      const hasAccessibleName =
        (text && text.trim().length > 0) || ariaLabel || ariaHidden === "true";
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("should have lang attribute on html element", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
  });

  test("should have proper image alt text", async ({ page }) => {
    const images = page.locator("img");
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const ariaHidden = await img.getAttribute("aria-hidden");

      // Each image should have alt text or be marked as decorative
      const isAccessible = alt !== null || ariaHidden === "true";
      expect(isAccessible).toBeTruthy();
    }
  });
});
