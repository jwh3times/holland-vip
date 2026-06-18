import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

describe("BentoGrid", () => {
  it("renders children and merges a custom className", () => {
    const { container } = render(
      <BentoGrid className="custom-class">
        <div>grid child</div>
      </BentoGrid>
    );
    expect(screen.getByText("grid child")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("custom-class");
    expect(container.firstChild).toHaveClass("grid");
  });

  it("renders an item with an icon", () => {
    render(
      <BentoGridItem
        title="Item Title"
        description="Item description"
        icon={<span data-testid="bento-icon" />}
      />
    );
    expect(screen.getByText("Item Title")).toBeInTheDocument();
    expect(screen.getByText("Item description")).toBeInTheDocument();
    expect(screen.getByTestId("bento-icon")).toBeInTheDocument();
  });

  it("renders an item without an icon", () => {
    render(<BentoGridItem title="No Icon" description="Still here" />);
    expect(screen.getByText("No Icon")).toBeInTheDocument();
    expect(screen.queryByTestId("bento-icon")).not.toBeInTheDocument();
  });

  it("spreads extra props onto the item root", () => {
    render(<BentoGridItem title="Spread" data-testid="bento-item" aria-label="bento card" />);
    const item = screen.getByTestId("bento-item");
    expect(item).toHaveAttribute("aria-label", "bento card");
  });
});
