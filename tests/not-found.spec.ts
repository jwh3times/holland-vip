import { test, expect } from "@playwright/test";

test.describe("Not Found (404)", () => {
  test("serves the 404 page for an unknown route", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");

    // The shipped static host (Cloudflare Pages / `serve out`) returns 404.html
    // with a 404 status; Next's dev server renders not-found with 404 too.
    expect(response?.status()).toBe(404);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("404");
    await expect(page.getByText("Page Not Found")).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Home" })).toBeVisible();
  });
});
