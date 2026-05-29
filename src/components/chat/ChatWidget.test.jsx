import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatWidget from "./ChatWidget";

// Mocks contextes
const mockUseAuth = vi.fn();
const mockUseChat = vi.fn();

vi.mock("../../context/AuthContext", () => ({ useAuth: () => mockUseAuth() }));
vi.mock("../../context/ChatContext", () => ({ useChat: () => mockUseChat() }));
vi.mock("./ChatWindow", () => ({
  default: ({ onClose }) => (
    <div data-testid="chat-window">
      <button onClick={onClose}>Fermer</button>
    </div>
  ),
}));

const userConnecte = { id: 1, username: "marie", is_staff: false, is_superuser: false };
const userStaff = { id: 2, username: "admin", is_staff: true, is_superuser: false };

describe("ChatWidget", () => {
  beforeEach(() => {
    mockUseChat.mockReturnValue({ unreadCount: 0 });
  });

  it("ne s'affiche pas si l'utilisateur est anonyme", () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { container } = render(<ChatWidget />);
    expect(container.firstChild).toBeNull();
  });

  it("ne s'affiche pas pour un utilisateur staff", () => {
    mockUseAuth.mockReturnValue({ user: userStaff });
    const { container } = render(<ChatWidget />);
    expect(container.firstChild).toBeNull();
  });

  it("ne s'affiche pas pour un superuser", () => {
    mockUseAuth.mockReturnValue({ user: { ...userConnecte, is_superuser: true } });
    const { container } = render(<ChatWidget />);
    expect(container.firstChild).toBeNull();
  });

  it("affiche le bouton d'ouverture pour un utilisateur connecté non-admin", () => {
    mockUseAuth.mockReturnValue({ user: userConnecte });
    render(<ChatWidget />);
    expect(screen.getByRole("button", { name: /ouvrir le chat/i })).toBeInTheDocument();
  });

  it("ouvre la fenêtre de chat au clic", () => {
    mockUseAuth.mockReturnValue({ user: userConnecte });
    render(<ChatWidget />);

    const btn = screen.getByRole("button", { name: /ouvrir le chat/i });
    fireEvent.click(btn);

    expect(screen.getByTestId("chat-window")).toBeInTheDocument();
  });

  it("ferme la fenêtre de chat au second clic", () => {
    mockUseAuth.mockReturnValue({ user: userConnecte });
    render(<ChatWidget />);

    const btn = screen.getByRole("button");
    fireEvent.click(btn); // ouvre
    expect(screen.getByTestId("chat-window")).toBeInTheDocument();

    // Fermer via le callback onClose
    fireEvent.click(screen.getByText("Fermer"));
    expect(screen.queryByTestId("chat-window")).not.toBeInTheDocument();
  });

  it("affiche le badge avec le nombre de non-lus", () => {
    mockUseAuth.mockReturnValue({ user: userConnecte });
    mockUseChat.mockReturnValue({ unreadCount: 3 });
    render(<ChatWidget />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3 non lu/i })).toBeInTheDocument();
  });

  it("affiche 99+ si plus de 99 messages non lus", () => {
    mockUseAuth.mockReturnValue({ user: userConnecte });
    mockUseChat.mockReturnValue({ unreadCount: 150 });
    render(<ChatWidget />);

    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("n'affiche pas le badge si 0 non-lus", () => {
    mockUseAuth.mockReturnValue({ user: userConnecte });
    mockUseChat.mockReturnValue({ unreadCount: 0 });
    render(<ChatWidget />);

    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("le bouton a aria-expanded=false quand fermé et true quand ouvert", () => {
    mockUseAuth.mockReturnValue({ user: userConnecte });
    render(<ChatWidget />);

    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
  });
});
