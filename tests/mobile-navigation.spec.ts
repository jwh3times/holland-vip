import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE viewport

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should show hamburger menu on mobile", async ({ page }) => {
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toBeVisible();
  });

  test("should hide desktop nav links on mobile", async ({ page }) => {
    // Selected by test id, not by the Tailwind classes that happen to hide it —
    // reordering `hidden md:flex` must not change what this test targets.
    await expect(page.getByTestId("desktop-nav")).toBeHidden();
  });

  test("should open mobile menu when hamburger is clicked", async ({ page }) => {
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await expect(menuButton).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-menu")).toHaveCount(0);

    await menuButton.click();

    // The panel the button says it controls is the one that opens.
    const mobileMenu = page.locator("#mobile-menu");
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenu).toHaveCount(1);

    // Close button should now be visible, and report the panel as expanded.
    const closeButton = page.locator('button[aria-label="Close menu"]');
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toHaveAttribute("aria-expanded", "true");
    await expect(closeButton).toHaveAttribute("aria-controls", "mobile-menu");
  });

  test("should close mobile menu when a link is clicked", async ({ page }) => {
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await menuButton.click();

    // Click on a nav link
    const aboutLink = page.locator('nav a[href="#about"]').last();
    await aboutLink.click();

    // Menu should close (hamburger button should reappear)
    const openButton = page.locator('button[aria-label="Open menu"]');
    await expect(openButton).toBeVisible();
  });

  test("should close mobile menu when X is clicked", async ({ page }) => {
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await menuButton.click();

    const closeButton = page.locator('button[aria-label="Close menu"]');
    await closeButton.click();

    // Menu should close
    const openButton = page.locator('button[aria-label="Open menu"]');
    await expect(openButton).toBeVisible();
  });

  test("should have theme toggle accessible on mobile", async ({ page }) => {
    // On mobile viewport, we should find a visible theme toggle button
    // The mobile header shows theme toggle + hamburger menu
    const themeToggle = page.locator('button[aria-label*="mode"]:visible');
    await expect(themeToggle).toBeVisible();
  });
});
