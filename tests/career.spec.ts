import { test, expect, type Page } from "@playwright/test";

const timeline = (page: Page) => page.getByRole("list", { name: "Career timeline" });
const log = (page: Page) => page.getByRole("list", { name: "Career log" });
const logRow = (page: Page, company: string) =>
  log(page).getByRole("button", { name: new RegExp(`@ ${company}`) });

test.describe("Career & stack", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#career");
  });

  test("starts with the current role open in the git log", async ({ page }) => {
    await expect(logRow(page, "SoftPro")).toHaveAttribute("aria-expanded", "true");
    await expect(logRow(page, "SAS Institute")).toHaveAttribute("aria-expanded", "false");
  });

  test("opens the clicked timeline role in the git log, and the log row closes it", async ({
    page,
  }) => {
    await timeline(page)
      .getByRole("button", { name: /SAS Institute/ })
      .click();

    await expect(timeline(page).getByRole("button", { name: /SAS Institute/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(logRow(page, "SAS Institute")).toHaveAttribute("aria-expanded", "true");
    await expect(logRow(page, "SoftPro")).toHaveAttribute("aria-expanded", "false");

    await logRow(page, "SAS Institute").click();
    await expect(logRow(page, "SAS Institute")).toHaveAttribute("aria-expanded", "false");
  });

  test("works from the keyboard", async ({ page }) => {
    await timeline(page)
      .getByRole("button", { name: /Humboldt Scientific/ })
      .focus();
    await page.keyboard.press("Enter");
    await expect(logRow(page, "Humboldt Scientific")).toHaveAttribute("aria-expanded", "true");

    await logRow(page, "Humboldt Scientific").focus();
    await page.keyboard.press("Space");
    await expect(logRow(page, "Humboldt Scientific")).toHaveAttribute("aria-expanded", "false");
  });

  test("holds the contribution heatmap, which Open Source no longer does", async ({ page }) => {
    const heatmap = page.getByRole("img", { name: /contributions in the last 12 months/ });
    await expect(page.locator("#career").getByRole("img", { name: /contributions/ })).toHaveCount(
      1
    );
    await expect(
      page.locator("#open-source").getByRole("img", { name: /contributions/ })
    ).toHaveCount(0);
    await expect(heatmap).toBeVisible();
  });

  test("scrolls the heatmap sideways on a phone rather than shrinking it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const region = page.getByRole("region", { name: "Contribution heatmap" });

    const { scrollWidth, clientWidth } = await region.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(scrollWidth).toBeGreaterThanOrEqual(640);
    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });
});
