import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { hasPersonnelRole, hasAnyStaffRole, hasAnyRedactionRole } from "../../utils/roles";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../utils/roles", () => ({
  hasPersonnelRole: vi.fn(),
  hasAnyStaffRole: vi.fn(),
  hasAnyRedactionRole: vi.fn(),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useAuth.mockReturnValue({ user: { id: 1 } });
  hasPersonnelRole.mockReturnValue(true);
  hasAnyStaffRole.mockReturnValue(true);
  hasAnyRedactionRole.mockReturnValue(true);
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdminSidebar", () => {
  it("renders visible navigation items", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ count: 2 }) });

    render(
      <MemoryRouter>
        <AdminSidebar open onClose={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getAllByRole("navigation", { name: "Menu d’administration" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Affectations")).toBeInTheDocument();
    expect(screen.getByText("Formations")).toBeInTheDocument();
    expect(screen.getByText("Articles")).toBeInTheDocument();
    expect(screen.getByText("Genres")).toBeInTheDocument();
    expect(screen.getByText("Feedbacks")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
  });
});
