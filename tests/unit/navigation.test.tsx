import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navigation } from "@/components/Navigation";

describe("Navigation", () => {
  it("renders the brand and desktop nav links", () => {
    render(<Navigation />);
    expect(screen.getByText("Jerry Holland")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: "Open Source" })).toHaveAttribute(
      "href",
      "#open-source"
    );
  });

  it("opens and closes the mobile menu", () => {
    render(<Navigation />);

    const openButton = screen.getByRole("button", { name: "Open menu" });
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    // Only the desktop "About" link exists while the menu is closed.
    expect(screen.getAllByRole("link", { name: "About" })).toHaveLength(1);

    fireEvent.click(openButton);
    const closeButton = screen.getByRole("button", { name: "Close menu" });
    expect(closeButton).toHaveAttribute("aria-expanded", "true");
    // Desktop + mobile copies are now present.
    const aboutLinks = screen.getAllByRole("link", { name: "About" });
    expect(aboutLinks).toHaveLength(2);

    // Clicking a mobile link closes the menu again.
    fireEvent.click(aboutLinks[1]);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "About" })).toHaveLength(1);
  });
});
