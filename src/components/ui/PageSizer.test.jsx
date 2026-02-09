import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PageSizer from "./PageSizer";
import { useTheme } from "../../context/ThemeContext";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReset();
});

describe("PageSizer", () => {
  it("renders page size options and triggers onChange", async () => {
    useTheme.mockReturnValue({ theme: "dark" });
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PageSizer pageSize={10} onChange={onChange} />);

    expect(screen.getByText("Afficher")).toBeInTheDocument();
    expect(screen.getByText("par page")).toBeInTheDocument();

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "20");
    expect(onChange).toHaveBeenCalledWith(20);
  });
});
