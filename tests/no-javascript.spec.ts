import { test, expect } from "@playwright/test";

// The static export has to stand on its own: a visitor (or crawler) without JavaScript sees the
// prerendered page, not a loading fallback waiting for a script that never runs.
test.describe("Without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("shows the page content, not the loading fallback", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "Jerry Holland" })).toBeVisible();
    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.getByText("Loading...")).toHaveCount(0);
  });
});
