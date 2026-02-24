import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RedactionRoute from "./RedactionRoute";
import { useAuth } from "../context/AuthContext";
import { hasAnyRedactionRole } from "../utils/roles";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../utils/roles", () => ({
  hasAnyRedactionRole: vi.fn(),
}));

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={["/redaction"]}>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/login" element={<div>Login</div>} />
        <Route
          path="/redaction"
          element={
            <RedactionRoute>
              <div>Redaction content</div>
            </RedactionRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("RedactionRoute", () => {
  beforeEach(() => {
    useAuth.mockReset();
    hasAnyRedactionRole.mockReset();
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

  it("redirects to home when missing redaction role", () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false });
    hasAnyRedactionRole.mockReturnValue(false);

    renderRoute();

    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders children when redaction role is present", () => {
    const user = { id: 1 };
    useAuth.mockReturnValue({ user, loading: false });
    hasAnyRedactionRole.mockReturnValue(true);

    renderRoute();

    expect(screen.getByText("Redaction content")).toBeInTheDocument();
  });

  it("checks redaction role against current user", () => {
    const user = { id: 2 };
    useAuth.mockReturnValue({ user, loading: false });
    hasAnyRedactionRole.mockReturnValue(true);

    renderRoute();

    expect(hasAnyRedactionRole).toHaveBeenCalledWith(user);
  });
});
