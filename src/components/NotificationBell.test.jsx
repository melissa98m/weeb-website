import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationBell from "./NotificationBell";
import * as NotifCtx from "../context/NotificationContext";

// Mock du context
vi.mock("../context/NotificationContext", () => ({
  useNotifications: vi.fn(),
}));

// Mock du dropdown pour isoler le test de la cloche
vi.mock("./NotificationDropdown", () => ({
  default: ({ onClose }) => (
    <div data-testid="dropdown">
      <button onClick={onClose}>Fermer</button>
    </div>
  ),
}));

function setup(unreadCount = 0) {
  NotifCtx.useNotifications.mockReturnValue({ unreadCount });
  return userEvent.setup();
}

describe("NotificationBell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rend un bouton avec aria-label 'Notifications' quand aucune non lue", () => {
    setup(0);
    render(<NotificationBell />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "Notifications");
  });

  it("affiche le compte dans aria-label quand il y a des non lues", () => {
    setup(3);
    render(<NotificationBell />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-label", "Notifications (3 non lues)");
  });

  it("utilise le singulier pour 1 notification non lue", () => {
    setup(1);
    render(<NotificationBell />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Notifications (1 non lue)"
    );
  });

  it("affiche le badge rouge avec le compte", () => {
    setup(5);
    render(<NotificationBell />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("n'affiche pas de badge si aucune notif non lue", () => {
    setup(0);
    render(<NotificationBell />);
    expect(screen.queryByText("0")).toBeNull();
  });

  it("affiche 99+ si le compteur dépasse 99", () => {
    setup(150);
    render(<NotificationBell />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("ouvre le dropdown au clic", async () => {
    const user = setup(0);
    render(<NotificationBell />);
    expect(screen.queryByTestId("dropdown")).toBeNull();

    await user.click(screen.getByRole("button"));

    expect(screen.getByTestId("dropdown")).toBeInTheDocument();
  });

  it("ferme le dropdown au second clic", async () => {
    const user = setup(0);
    render(<NotificationBell />);

    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    await user.click(bellBtn);
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();

    await user.click(bellBtn);
    expect(screen.queryByTestId("dropdown")).toBeNull();
  });

  it("ferme le dropdown avec la touche Escape", async () => {
    const user = setup(0);
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByTestId("dropdown")).toBeNull();
  });

  it("met à jour aria-expanded selon l'état du dropdown", async () => {
    const user = setup(0);
    render(<NotificationBell />);
    const btn = screen.getByRole("button");

    expect(btn).toHaveAttribute("aria-expanded", "false");

    await user.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });

  it("a aria-haspopup=dialog sur le bouton", () => {
    setup(0);
    render(<NotificationBell />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("ferme le dropdown via onClose du dropdown", async () => {
    const user = setup(0);
    render(<NotificationBell />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("dropdown")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(screen.queryByTestId("dropdown")).toBeNull();
  });
});
