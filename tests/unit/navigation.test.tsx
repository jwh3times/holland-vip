import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Navigation } from "@/components/Navigation";
import { NAV_SECTION_IDS } from "@/components/ui/section";
import { siteConfig } from "@/lib/site-config";

describe("Navigation", () => {
  it("is a banner whose shell prompt links back to the top of the page", () => {
    render(<Navigation />);
    const banner = screen.getByRole("banner");
    expect(within(banner).getByRole("link", { name: `${siteConfig.email}:~` })).toHaveAttribute(
      "href",
      "#top"
    );
  });

  it("links every nav section once, in registry order, with its mono label", () => {
    render(<Navigation />);
    const links = within(screen.getByRole("navigation", { name: "Sections" })).getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      NAV_SECTION_IDS.map((id) => `#${id}`)
    );
    expect(links.map((link) => link.textContent)).toEqual([
      "about.md",
      "career.log",
      "work/",
      "open-source/",
      "contact.sh",
    ]);
  });

  it("keeps the theme toggle in the header, with no separate mobile menu", () => {
    render(<Navigation />);
    const banner = screen.getByRole("banner");
    // The toggle renders its inert placeholder or the live button; either sits here.
    expect(banner.querySelector("button")).not.toBeNull();
    expect(screen.queryByRole("button", { name: /menu/i })).not.toBeInTheDocument();
  });
});
