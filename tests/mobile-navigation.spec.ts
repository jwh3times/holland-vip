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
    // Desktop nav should be hidden
    const desktopNav = page.locator("nav .hidden.md\\:flex");
    await expect(desktopNav).toBeHidden();
  });

  test("should open mobile menu when hamburger is clicked", async ({ page }) => {
    const menuButton = page.locator('button[aria-label="Open menu"]');
    await menuButton.click();

    // Mobile menu should now be visible
    const mobileMenu = page.locator("nav .md\\:hidden").last();
    await expect(mobileMenu).toBeVisible();

    // Close button should now be visible
    const closeButton = page.locator('button[aria-label="Close menu"]');
    await expect(closeButton).toBeVisible();
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
