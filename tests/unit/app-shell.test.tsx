import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ErrorBoundary from "@/app/error";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

describe("app shell screens", () => {
  it("Loading shows the spinner label", () => {
    render(<Loading />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("NotFound shows the 404 message and a home link", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "404" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Page Not Found" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  });

  it("Error logs the error and retries via reset", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const reset = vi.fn();

    render(<ErrorBoundary error={new Error("boom")} reset={reset} />);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
