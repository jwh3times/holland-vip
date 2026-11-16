import { test, expect, type Page } from "@playwright/test";

// The hydrated pill. The pre-hydration placeholder is aria-hidden and unlabelled,
// so this only matches the interactive button.
const themeToggle = (page: Page) => page.getByRole("button", { name: /^Theme:/ });

test.describe("Theme Toggle", () => {
  // Each test gets a fresh context, so there is no stored preference to begin with.
  for (const scheme of ["light", "dark"] as const) {
    test(`follows the OS ${scheme} scheme when nothing is stored`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");

      const html = page.locator("html");
      if (scheme === "dark") await expect(html).toHaveClass(/\bdark\b/);
      else await expect(html).not.toHaveClass(/\bdark\b/);

      const button = themeToggle(page);
      await expect(button).toHaveText(/◒\s*auto/);
      await expect(button).toHaveAttribute(
        "aria-label",
        `Theme: auto (${scheme}). Switch to dark.`
      );
    });
  }

  test("cycles auto → dark → light → auto, labelling each state", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    const html = page.locator("html");
    const button = themeToggle(page);

    const steps = [
      { text: /◐\s*dark/, label: "Theme: dark. Switch to light.", dark: true },
      { text: /◑\s*light/, label: "Theme: light. Switch to auto.", dark: false },
      { text: /◒\s*auto/, label: "Theme: auto (light). Switch to dark.", dark: false },
    ];
    for (const step of steps) {
      await button.click();
      await expect(button).toHaveText(step.text);
      await expect(button).toHaveAttribute("aria-label", step.label);
      if (step.dark) await expect(html).toHaveClass(/\bdark\b/);
      else await expect(html).not.toHaveClass(/\bdark\b/);
    }
  });

  test("names the painted theme in the status bar, following the toggle", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const statusBar = page.getByRole("contentinfo");
    const button = themeToggle(page);

    // auto resolves to the OS scheme; the bar never says "auto" or "system".
    await expect(statusBar).toContainText("UTF-8 · LF · dark");
    await button.click(); // → dark
    await expect(statusBar).toContainText("UTF-8 · LF · dark");
    await button.click(); // → light
    await expect(statusBar).toContainText("UTF-8 · LF · light");
    await button.click(); // → auto (dark)
    await expect(statusBar).toContainText("UTF-8 · LF · dark");
  });

  test("persists an explicit choice across reload, over the OS scheme", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    const html = page.locator("html");
    const button = themeToggle(page);

    // auto (dark) → dark → light
    await button.click();
    await button.click();
    await expect(button).toHaveText(/◑\s*light/);
    await expect(html).not.toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(html).not.toHaveClass(/\bdark\b/);
    await expect(themeToggle(page)).toHaveText(/◑\s*light/);
  });
});
