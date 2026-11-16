import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE viewport

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("keeps every section link in one row that scrolls sideways", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });
    await expect(nav).toBeVisible();

    // The row is narrower than its links, and scrolls rather than wrapping or clipping.
    const { scrollWidth, clientWidth, overflowX } = await nav.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflowX: getComputedStyle(el).overflowX,
    }));
    expect(scrollWidth).toBeGreaterThan(clientWidth);
    expect(overflowX).toBe("auto");

    // The header stays a single row: the links never wrap beneath the prompt.
    const [prompt, last] = await Promise.all([
      page.getByRole("banner").getByRole("link", { name: /:~$/ }).boundingBox(),
      nav.getByRole("link").last().boundingBox(),
    ]);
    expect(Math.abs(prompt!.y + prompt!.height / 2 - (last!.y + last!.height / 2))).toBeLessThan(4);
  });

  test("reaches the last link by scrolling the row, and it navigates", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Sections" });
    const last = nav.getByRole("link").last();

    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeInViewport();
    const href = await last.getAttribute("href");
    await last.click();
    await expect(page.locator(href!)).toBeInViewport();
  });

  test("keeps the theme toggle in the header", async ({ page }) => {
    await expect(page.getByRole("banner").getByRole("button", { name: /^Theme:/ })).toBeVisible();
  });
});
