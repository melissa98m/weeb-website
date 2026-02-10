import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLayout from "./AdminLayout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../components/admin/AdminSidebar", () => ({
  default: ({ open, onClose }) => (
    <div>
      <span>Sidebar {open ? "open" : "closed"}</span>
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    useAuth.mockReset();
    useTheme.mockReset();
  });

  it("asks user to login when unauthenticated", () => {
    useAuth.mockReturnValue({ user: null });
    useTheme.mockReturnValue({ theme: "dark" });

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Veuillez vous connecter.")).toBeInTheDocument();
  });

  it("renders children and sidebar when authenticated", () => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    useTheme.mockReturnValue({ theme: "dark" });

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Sidebar closed")).toBeInTheDocument();
  });

  it("opens sidebar on menu click", async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ user: { id: 1 } });
    useTheme.mockReturnValue({ theme: "dark" });

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    await user.click(screen.getByRole("button", { name: /menu/i }));

    expect(screen.getByText("Sidebar open")).toBeInTheDocument();
  });

  it("closes sidebar when onClose called", async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ user: { id: 1 } });
    useTheme.mockReturnValue({ theme: "dark" });

    render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    await user.click(screen.getByRole("button", { name: /menu/i }));
    await user.click(screen.getByRole("button", { name: "close" }));

    expect(screen.getByText("Sidebar closed")).toBeInTheDocument();
  });

  it("applies dark theme classes", () => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    useTheme.mockReturnValue({ theme: "dark" });

    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(container.firstChild.className).toContain("bg-background");
  });

  it("applies light theme classes", () => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    useTheme.mockReturnValue({ theme: "light" });

    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    expect(container.firstChild.className).toContain("bg-light");
  });
});
