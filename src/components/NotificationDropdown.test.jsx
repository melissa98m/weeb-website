import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationDropdown from "./NotificationDropdown";
import * as NotifCtx from "../context/NotificationContext";

vi.mock("../context/NotificationContext", () => ({
  useNotifications: vi.fn(),
}));

const NOTIF_UNREAD = {
  id: 1,
  type: "inscription",
  message: "Vous êtes inscrit à la formation React",
  read: false,
  created_at: "2025-01-15T10:00:00",
};

const NOTIF_READ = {
  id: 2,
  type: "feedback",
  message: "Votre feedback a été traité",
  read: true,
  created_at: "2025-01-14T08:00:00",
};

function setup({ notifications = [], unreadCount = 0, markRead = vi.fn(), markAllRead = vi.fn() } = {}) {
  NotifCtx.useNotifications.mockReturnValue({ notifications, unreadCount, markRead, markAllRead });
  return userEvent.setup();
}

describe("NotificationDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche 'Aucune notification' si la liste est vide", () => {
    setup();
    render(<NotificationDropdown onClose={vi.fn()} />);
    expect(screen.getByText(/aucune notification/i)).toBeInTheDocument();
  });

  it("affiche les notifications de la liste", () => {
    setup({ notifications: [NOTIF_UNREAD, NOTIF_READ] });
    render(<NotificationDropdown onClose={vi.fn()} />);
    expect(screen.getByText(NOTIF_UNREAD.message)).toBeInTheDocument();
    expect(screen.getByText(NOTIF_READ.message)).toBeInTheDocument();
  });

  it("affiche le bouton 'Tout marquer lu' si unreadCount > 0", () => {
    setup({ notifications: [NOTIF_UNREAD], unreadCount: 1 });
    render(<NotificationDropdown onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: /tout marquer lu/i })).toBeInTheDocument();
  });

  it("n'affiche pas 'Tout marquer lu' si unreadCount === 0", () => {
    setup({ notifications: [NOTIF_READ], unreadCount: 0 });
    render(<NotificationDropdown onClose={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /tout marquer lu/i })).toBeNull();
  });

  it("appelle markAllRead au clic sur 'Tout marquer lu'", async () => {
    const markAllRead = vi.fn();
    const user = setup({ notifications: [NOTIF_UNREAD], unreadCount: 1, markAllRead });
    render(<NotificationDropdown onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /tout marquer lu/i }));
    expect(markAllRead).toHaveBeenCalledOnce();
  });

  it("appelle markRead au clic sur une notification non lue", async () => {
    const markRead = vi.fn();
    const user = setup({ notifications: [NOTIF_UNREAD], unreadCount: 1, markRead });
    render(<NotificationDropdown onClose={vi.fn()} />);

    await user.click(screen.getByText(NOTIF_UNREAD.message));
    expect(markRead).toHaveBeenCalledWith(NOTIF_UNREAD.id);
  });

  it("ne rappelle pas markRead pour une notification déjà lue", async () => {
    const markRead = vi.fn();
    const user = setup({ notifications: [NOTIF_READ], unreadCount: 0, markRead });
    render(<NotificationDropdown onClose={vi.fn()} />);

    await user.click(screen.getByText(NOTIF_READ.message));
    expect(markRead).not.toHaveBeenCalled();
  });

  it("affiche le point bleu uniquement pour les notifs non lues", () => {
    setup({ notifications: [NOTIF_UNREAD, NOTIF_READ] });
    render(<NotificationDropdown onClose={vi.fn()} />);
    const dots = screen.getAllByLabelText("Non lue");
    expect(dots).toHaveLength(1);
  });

  it("a role=dialog et aria-modal=true", () => {
    setup();
    render(<NotificationDropdown onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("a aria-label='Notifications' sur le dialog", () => {
    setup();
    render(<NotificationDropdown onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "Notifications");
  });

  it("appelle onClose au clic en dehors du dropdown", () => {
    const onClose = vi.fn();
    setup();
    render(
      <div>
        <NotificationDropdown onClose={onClose} />
        <button data-testid="outside">Dehors</button>
      </div>
    );

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(onClose).toHaveBeenCalled();
  });

  it("n'appelle pas onClose au clic à l'intérieur du dropdown", () => {
    const onClose = vi.fn();
    setup();
    render(<NotificationDropdown onClose={onClose} />);

    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("affiche les icônes correctes selon le type", () => {
    const notifs = [
      { ...NOTIF_UNREAD, type: "inscription" },
      { ...NOTIF_READ, id: 3, type: "feedback" },
      { id: 4, type: "info", message: "Info", read: false, created_at: "2025-01-01T00:00:00" },
    ];
    setup({ notifications: notifs, unreadCount: 2 });
    render(<NotificationDropdown onClose={vi.fn()} />);

    expect(screen.getByText("🎓")).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
    expect(screen.getByText("ℹ️")).toBeInTheDocument();
  });
});
