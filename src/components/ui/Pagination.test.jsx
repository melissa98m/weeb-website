import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination page={1} pageCount={1} onPageChange={() => {}} theme="light" />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders compact pagination with dots and changes page", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination page={5} pageCount={10} onPageChange={onPageChange} theme="light" />
    );

    expect(screen.getAllByText("…").length).toBe(2);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "5" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "6" }));
    expect(onPageChange).toHaveBeenCalledWith(6);

    await user.click(screen.getByRole("button", { name: "5" }));
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it("disables previous/next at bounds", () => {
    const onPageChange = vi.fn();

    const { rerender } = render(
      <Pagination page={1} pageCount={3} onPageChange={onPageChange} theme="light" />
    );
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();

    rerender(<Pagination page={3} pageCount={3} onPageChange={onPageChange} theme="light" />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
