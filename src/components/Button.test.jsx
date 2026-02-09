import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Button from "./Button";

describe("Button", () => {
  it("renders a link when `to` is provided", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <MemoryRouter>
        <Button to="/blog" disabled onClick={onClick}>
          Go
        </Button>
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: "Go" });
    expect(link).toHaveAttribute("aria-disabled", "true");

    await user.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("defaults to submit when no onClick is provided", () => {
    render(<Button>Submit</Button>);

    const btn = screen.getByRole("button", { name: "Submit" });
    expect(btn).toHaveAttribute("type", "submit");
  });

  it("defaults to button when onClick is provided", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Action</Button>);

    const btn = screen.getByRole("button", { name: "Action" });
    expect(btn).toHaveAttribute("type", "button");
  });
});
