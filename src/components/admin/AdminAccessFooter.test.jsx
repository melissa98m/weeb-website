import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminAccessFooter from "./AdminAccessFooter";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { hasAnyRole } from "../../utils/roles";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../utils/roles", () => ({
  hasAnyRole: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useAuth.mockReturnValue({ user: { id: 1, groups: [] } });
  hasAnyRole.mockReset();
});

describe("AdminAccessFooter", () => {
  it("shows access denied when user lacks role", () => {
    hasAnyRole.mockReturnValue(false);

    render(<AdminAccessFooter allowedRoles={["Personnel"]} />);

    expect(screen.getByText(/Accès refusé/)).toBeInTheDocument();
    expect(screen.getByText(/Accès réservé : Personnel/)).toBeInTheDocument();
  });

  it("shows access allowed when user has role", () => {
    hasAnyRole.mockReturnValue(true);

    render(<AdminAccessFooter allowedRoles={["Personnel", "Commercial"]} />);

    expect(screen.getByText(/Accès autorisé/)).toBeInTheDocument();
    expect(screen.getByText(/Accès réservé : Personnel, Commercial/)).toBeInTheDocument();
  });
});
