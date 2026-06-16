import { test, expect, type Page } from "@playwright/test";

// The visible toggle (desktop or mobile). The pre-hydration placeholder has no
// aria-label, so this only matches the hydrated, interactive button.
const themeToggle = (page: Page) => page.locator('button[aria-label*="mode"]:visible').first();

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    // Pin the OS color scheme so `defaultTheme="system"` resolves deterministically
    // to light on load (each test gets a fresh context, so localStorage is clean).
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
  });

  test("renders a theme toggle button", async ({ page }) => {
    await expect(themeToggle(page)).toBeVisible();
  });

  test("toggles from light to dark and back", async ({ page }) => {
    const html = page.locator("html");
    const button = themeToggle(page);

    // Starts light (system = emulated light, no stored preference).
    await expect(html).not.toHaveClass(/dark/);

    await button.click();
    await expect(html).toHaveClass(/dark/);

    await button.click();
    await expect(html).not.toHaveClass(/dark/);
  });

  test("updates aria-label to reflect the next action", async ({ page }) => {
    const button = themeToggle(page);

    await expect(button).toHaveAttribute("aria-label", "Activate dark mode");
    await button.click();
    await expect(button).toHaveAttribute("aria-label", "Activate light mode");
  });

  test("persists the selected theme across reload", async ({ page }) => {
    const html = page.locator("html");
    const button = themeToggle(page);

    await button.click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });
});
