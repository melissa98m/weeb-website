import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import StaffRoute from "./StaffRoute";
import { useAuth } from "../context/AuthContext";
import { hasAnyStaffRole } from "../utils/roles";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../utils/roles", () => ({
  hasAnyStaffRole: vi.fn(),
}));

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={["/staff"]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route
          path="/staff"
          element={
            <StaffRoute>
              <div>Staff content</div>
            </StaffRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("StaffRoute", () => {
  beforeEach(() => {
    useAuth.mockReset();
    hasAnyStaffRole.mockReset();
  });

  it("renders nothing while loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    const { container } = renderRoute();

    expect(container.firstChild).toBeNull();
  });

  it("redirects to login when unauthenticated", () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    renderRoute();

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("redirects to home when missing staff role", () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false });
    hasAnyStaffRole.mockReturnValue(false);

    renderRoute();

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders children when staff role is present", () => {
    const user = { id: 1 };
    useAuth.mockReturnValue({ user, loading: false });
    hasAnyStaffRole.mockReturnValue(true);

    renderRoute();

    expect(screen.getByText("Staff content")).toBeInTheDocument();
  });

  it("checks staff role against current user", () => {
    const user = { id: 2 };
    useAuth.mockReturnValue({ user, loading: false });
    hasAnyStaffRole.mockReturnValue(true);

    renderRoute();

    expect(hasAnyStaffRole).toHaveBeenCalledWith(user);
  });
});
