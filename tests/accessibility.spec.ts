import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Scope to WCAG 2.0/2.1 A & AA success criteria — the conformance bar we hold
// ourselves to — rather than axe's best-practice rules (which flag stylistic
// nits like every region needing a landmark).
const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // These assert what the skip link *does*, not which utility classes it carries.
  // Class-name assertions passed as long as the string was present, even if the
  // styles never applied.
  test("skip link is rendered but visually collapsed until focused", async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    const collapsed = await skipLink.boundingBox();
    expect(collapsed, "skip link should occupy a box, however small").not.toBeNull();
    expect(collapsed!.width).toBeLessThanOrEqual(2);
    expect(collapsed!.height).toBeLessThanOrEqual(2);
  });

  test("skip link becomes visible and targets main content on focus", async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    const collapsed = await skipLink.boundingBox();

    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    const focused = await skipLink.boundingBox();
    expect(focused!.width).toBeGreaterThan(collapsed!.width);
    expect(focused!.height).toBeGreaterThan(collapsed!.height);
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveText(/skip to main content/i);

    // And it points at a target that exists.
    await expect(page.locator("#main-content")).toHaveCount(1);
  });

  test("skip link is the first thing keyboard focus reaches", async ({ page }) => {
    await page.keyboard.press("Tab");
    await expect(page.locator('a[href="#main-content"]')).toBeFocused();
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
    // Wait for hydration to settle: the theme toggle renders an aria-hidden
    // placeholder during SSR and swaps to a real, aria-labelled button on mount.
    // Checking buttons mid-swap races that mutation, so anchor on the real button.
    await expect(
      page.getByRole("button", { name: /Activate (light|dark) mode/ }).first()
    ).toBeVisible();

    // Snapshot every button's accessible name atomically in the browser so no
    // single check straddles a DOM mutation. A button is accessible if it has
    // visible text, an aria-label, or is marked decorative (aria-hidden).
    const inaccessibleButtons = await page.locator("button").evaluateAll((buttons) =>
      buttons
        .filter((btn) => {
          const text = btn.textContent?.trim() ?? "";
          const ariaLabel = btn.getAttribute("aria-label");
          const ariaHidden = btn.getAttribute("aria-hidden");
          return !(text.length > 0 || ariaLabel || ariaHidden === "true");
        })
        .map((btn) => btn.outerHTML)
    );

    expect(inaccessibleButtons).toEqual([]);
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

  test("has no WCAG A/AA violations in light mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();

    expect(results.violations).toEqual([]);
  });

  test("has no WCAG A/AA violations in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();

    expect(results.violations).toEqual([]);
  });
});
