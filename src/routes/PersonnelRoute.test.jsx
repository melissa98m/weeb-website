import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PersonnelRoute from "./PersonnelRoute";
import { useAuth } from "../context/AuthContext";
import { hasPersonnelRole } from "../utils/roles";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../utils/roles", () => ({
  hasPersonnelRole: vi.fn(),
}));

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={["/personnel"]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route
          path="/personnel"
          element={
            <PersonnelRoute>
              <div>Personnel content</div>
            </PersonnelRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("PersonnelRoute", () => {
  beforeEach(() => {
    useAuth.mockReset();
    hasPersonnelRole.mockReset();
  });

  it("shows loading state", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    renderRoute();

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("redirects to login when unauthenticated", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderRoute();

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("redirects to home when missing personnel role", () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false });
    hasPersonnelRole.mockReturnValue(false);

    renderRoute();

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders children when personnel role is present", () => {
    const user = { id: 1 };
    useAuth.mockReturnValue({ user, loading: false });
    hasPersonnelRole.mockReturnValue(true);

    renderRoute();

    expect(screen.getByText("Personnel content")).toBeInTheDocument();
  });

  it("checks personnel role against current user", () => {
    const user = { id: 2 };
    useAuth.mockReturnValue({ user, loading: false });
    hasPersonnelRole.mockReturnValue(true);

    renderRoute();

    expect(hasPersonnelRole).toHaveBeenCalledWith(user);
  });
});
