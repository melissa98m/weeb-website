import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenreChips from "./GenreChips";

describe("GenreChips", () => {
  it("toggles active genre", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const genres = [
      { id: null, name: "All", color: null },
      { id: 1, name: "Tech", color: "#ff0000" },
    ];

    render(
      <GenreChips
        genres={genres}
        selectedId={1}
        onChange={onChange}
        theme="light"
      />
    );

    await user.click(screen.getByRole("button", { name: "Tech" }));
    expect(onChange).toHaveBeenCalledWith(null);

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
