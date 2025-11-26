import { test, expect } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should have a theme toggle button", async ({ page }) => {
    // Select the visible theme toggle (works on both desktop and mobile)
    const themeToggle = page.locator('button[aria-label*="mode"]:visible').first();
    await expect(themeToggle).toBeVisible();
  });

  test("should toggle between light and dark mode", async ({ page }) => {
    const html = page.locator("html");
    const themeToggle = page.locator('button[aria-label*="mode"]:visible').first();

    // Get initial theme state
    const initialClass = await html.getAttribute("class");

    // Click to toggle theme
    await themeToggle.click();

    // Wait for theme to change
    await page.waitForTimeout(500);

    // Check that theme has changed
    const newClass = await html.getAttribute("class");

    // One should have 'dark' class, the other shouldn't
    const wasLight = !initialClass?.includes("dark");
    const isNowDark = newClass?.includes("dark");

    if (wasLight) {
      expect(isNowDark).toBe(true);
    } else {
      expect(isNowDark).toBe(false);
    }
  });

  test("should update aria-label when theme changes", async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="mode"]:visible').first();

    const initialLabel = await themeToggle.getAttribute("aria-label");

    await themeToggle.click();
    await page.waitForTimeout(500);

    const newLabel = await themeToggle.getAttribute("aria-label");

    // Labels should be different after toggle
    expect(newLabel).not.toBe(initialLabel);
  });

  test("should persist theme preference", async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="mode"]:visible').first();

    // Switch to dark mode
    await themeToggle.click();
    await page.waitForTimeout(500);

    // Check if dark mode is active
    const isDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));

    // Reload the page
    await page.reload();
    await page.waitForTimeout(500);

    // Theme should persist
    const isStillDark = await page.locator("html").evaluate((el) => el.classList.contains("dark"));

    expect(isStillDark).toBe(isDark);
  });
});
