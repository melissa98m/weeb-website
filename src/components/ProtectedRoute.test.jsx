import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <div>Secret content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuth.mockReset();
});

describe("ProtectedRoute", () => {
  it("renders nothing while loading", () => {
    useAuth.mockReturnValue({ user: null, loading: true });
    const { container } = renderProtected();

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText("Login page")).toBeNull();
  });

  it("redirects to login when user is not authenticated", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    renderProtected();

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    useAuth.mockReturnValue({ user: { id: 1 }, loading: false });
    renderProtected();

    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });
});
