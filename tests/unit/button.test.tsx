import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";

describe("Button", () => {
  it("renders a button with the default variant", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: "Click me" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("inline-flex");
    expect(btn.className).toContain("bg-blue-600");
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="outline" size="lg">
        Outline
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Outline" });
    expect(btn.className).toContain("border");
    expect(btn.className).toContain("h-11");
  });

  it("forwards the onClick handler", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Press</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Press" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders as its child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/somewhere">Link button</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Link button" });
    expect(link).toHaveAttribute("href", "/somewhere");
    expect(link).toHaveClass("inline-flex");
  });

  it("exposes the buttonVariants helper", () => {
    expect(typeof buttonVariants).toBe("function");
    expect(buttonVariants({ variant: "ghost", size: "icon" })).toContain("h-10");
  });
});
