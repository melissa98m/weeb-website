import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FormationModal from "./FormationModal";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

const t = { close: "Close", contact_us: "Contact us" };
const formation = { name: "React Basics", description: "Learn the basics" };

describe("FormationModal", () => {
  it("renders content and reacts to overlay click and Escape", () => {
    const onClose = vi.fn();

    render(
      <MemoryRouter>
        <FormationModal open onClose={onClose} formation={formation} theme="light" t={t} />
      </MemoryRouter>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("React Basics")).toBeInTheDocument();

    const overlay = document.querySelector("div.fixed.inset-0");
    fireEvent.click(overlay);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("locks body scroll while open and restores on close", () => {
    const onClose = vi.fn();

    const { rerender } = render(
      <MemoryRouter>
        <FormationModal open onClose={onClose} formation={formation} theme="light" t={t} />
      </MemoryRouter>
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <MemoryRouter>
        <FormationModal open={false} onClose={onClose} formation={formation} theme="light" t={t} />
      </MemoryRouter>
    );

    expect(document.body.style.overflow).toBe("");
  });
});
