import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FiltersBar from "./FiltersBar";
import { useTheme } from "../../context/ThemeContext";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../components/ui/Select", () => ({
  default: ({ id, value, onChange, options, placeholder }) => (
    <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  ),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
});

describe("FiltersBar", () => {
  it("updates filters and search", async () => {
    const user = userEvent.setup();
    const setFilterUser = vi.fn();
    const setFilterFormation = vi.fn();
    const setSearchUser = vi.fn();

    render(
      <FiltersBar
        userOptions={[{ value: "u1", label: "User1" }]}
        formationOptions={[{ value: "f1", label: "Form1" }]}
        filterUser={null}
        setFilterUser={setFilterUser}
        filterFormation={null}
        setFilterFormation={setFilterFormation}
        searchUser=""
        setSearchUser={setSearchUser}
      />
    );

    await user.selectOptions(screen.getByLabelText("Filtrer par utilisateur"), "u1");
    expect(setFilterUser).toHaveBeenCalledWith("u1");

    await user.selectOptions(screen.getByLabelText("Filtrer par formation"), "f1");
    expect(setFilterFormation).toHaveBeenCalledWith("f1");

    const input = screen.getByLabelText("Recherche utilisateur");
    await user.type(input, "ada");
    const calls = setSearchUser.mock.calls.map((c) => c[0]);
    expect(calls.join("")).toBe("ada");
  });
});
