import { test, expect, type Page } from "@playwright/test";

const section = (page: Page) => page.locator("section#projects");
const card = (page: Page, name: string) => section(page).getByRole("article", { name });
const lines = (page: Page, name: string) =>
  card(page, name).getByTestId("sample-output").locator("[data-line]");

/**
 * The cards' markup is static HTML until React hydrates, so a hover before then does nothing.
 * The theme toggle swaps its placeholder for a labelled button on mount: once it is there, the
 * page has hydrated.
 */
async function hydrated(page: Page) {
  await expect(page.getByRole("button", { name: /^Theme:/ })).toBeVisible();
}

test.describe("Hobby projects", () => {
  test("renders four cards under #projects, each linking out and labelling its sample output", async ({
    page,
  }) => {
    await page.goto("/#projects");

    await expect(section(page).getByRole("heading", { level: 2 })).toHaveText(/Hobby projects/);
    await expect(section(page).getByRole("article")).toHaveCount(4);
    for (const name of ["Nearcited", "causet", "Magic Agenda", "Press"]) {
      await expect(card(page, name).getByText("sample output")).toBeVisible();
      await expect(card(page, name).getByRole("link", { name: `open ${name}` })).toHaveAttribute(
        "target",
        "_blank"
      );
    }
    await expect(page.locator("#open-source")).toHaveCount(0);
  });

  test("the hero's ./see-projects lands on the cards and work/ on Professional work", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "./see-projects" }).click();
    await expect(section(page)).toBeInViewport();

    await page
      .getByRole("navigation", { name: "Sections" })
      .getByRole("link", { name: "work/" })
      .click();
    await expect(page.locator("section#work")).toBeInViewport();
    await expect(page.locator("section#work").getByRole("heading", { level: 2 })).toHaveText(
      /Professional work/
    );
  });

  test("replays the sample output on hover, then shows it idle again", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/#projects");
    await hydrated(page);
    const causet = lines(page, "causet");
    await expect(causet.first()).toHaveAttribute("data-line", "idle");

    await card(page, "causet").hover();
    await expect(causet.last()).toHaveAttribute("data-line", "hidden");
    await expect(causet.first()).toHaveAttribute("data-line", "shown");
    await expect(causet.last()).toHaveAttribute("data-line", "shown");

    await page.mouse.move(0, 0);
    await expect(causet.last()).toHaveAttribute("data-line", "idle");
  });

  test("replays when keyboard focus reaches a card's link", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/#projects");
    await hydrated(page);

    await card(page, "Press").getByRole("link", { name: "open Press" }).focus();
    await expect(lines(page, "Press").last()).toHaveAttribute("data-line", "hidden");
    await expect(lines(page, "Press").last()).toHaveAttribute("data-line", "shown");
  });

  test("does not replay or lift under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#projects");
    const nearcited = card(page, "Nearcited");
    await hydrated(page);

    await nearcited.hover();
    await expect(nearcited).toHaveAttribute("data-active", "true");
    for (const line of await lines(page, "Nearcited").all()) {
      await expect(line).toHaveAttribute("data-line", "shown");
    }
    // Tailwind v4 lifts through the `translate` property; reduced motion leaves it unset.
    expect(await nearcited.evaluate((el) => getComputedStyle(el).translate)).toBe("none");
  });
});
