import { test, expect, type Page } from "@playwright/test";

const section = (page: Page) => page.locator("section#impact");

test.describe("Impact", () => {
  test("impact.diff lands on the Impact section", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link", { name: "impact.diff" })
      .click();
    await expect(section(page)).toBeInViewport();
    await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(/Impact/);
  });

  test("shows the signed highlights, the three cases, and the capabilities and achievements", async ({
    page,
  }) => {
    await page.goto("/#impact");
    const impact = section(page);

    const highlights = impact.getByRole("list", { name: "Career Highlights" });
    await expect(highlights.getByText("−83%")).toBeVisible();
    await expect(highlights.getByText("+15%")).toBeVisible();

    const cases = impact.getByRole("list", { name: "Problem-Solving Highlights" });
    for (const label of ["case #001", "case #002", "case #003"]) {
      await expect(cases.getByText(label)).toBeVisible();
    }
    await expect(cases.getByText("45s → 3s")).toBeVisible();

    await expect(
      impact.getByRole("list", { name: "Technical Capabilities" }).getByRole("listitem", {
        name: "Performance Engineering",
      })
    ).toBeVisible();
    await expect(
      impact.getByRole("list", { name: "Technical Achievements" }).getByRole("listitem", {
        name: "Database Performance Optimization",
      })
    ).toBeVisible();
  });
});
