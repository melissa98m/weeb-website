import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWindow from "./ChatWindow";

// Mocks
const mockUseChat = vi.fn();
const mockUseAuth = vi.fn();
const mockUseTheme = vi.fn();

vi.mock("../../context/ChatContext", () => ({ useChat: () => mockUseChat() }));
vi.mock("../../context/AuthContext", () => ({ useAuth: () => mockUseAuth() }));
vi.mock("../../context/ThemeContext", () => ({ useTheme: () => mockUseTheme() }));

const userConnecte = { id: 1, username: "marie" };

const chatConnecte = {
  messages: [],
  connected: true,
  connecting: false,
  sendMessage: vi.fn(() => true),
  markRead: vi.fn(),
};

// scrollIntoView n'existe pas dans jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("ChatWindow", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: userConnecte });
    mockUseTheme.mockReturnValue({ theme: "light" });
    mockUseChat.mockReturnValue({ ...chatConnecte });
  });

  it("affiche le titre Support", () => {
    render(<ChatWindow onClose={onClose} />);
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("a role=dialog avec aria-modal=true", () => {
    render(<ChatWindow onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("affiche le message vide si aucun message", () => {
    render(<ChatWindow onClose={onClose} />);
    expect(screen.getByText(/démarrez la conversation/i)).toBeInTheDocument();
  });

  it("affiche les messages existants", () => {
    mockUseChat.mockReturnValue({
      ...chatConnecte,
      messages: [
        { id: 1, sender_id: 1, sender_username: "marie", sender_is_staff: false, content: "Bonjour", read: false, created_at: new Date().toISOString() },
        { id: 2, sender_id: 99, sender_username: "support", sender_is_staff: true, content: "Comment puis-je vous aider ?", read: true, created_at: new Date().toISOString() },
      ],
    });
    render(<ChatWindow onClose={onClose} />);
    expect(screen.getByText("Bonjour")).toBeInTheDocument();
    expect(screen.getByText("Comment puis-je vous aider ?")).toBeInTheDocument();
  });

  it("ferme le chat via le bouton Fermer", () => {
    render(<ChatWindow onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /fermer le chat/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ferme le chat via la touche Escape", () => {
    render(<ChatWindow onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("envoie le message via le bouton Envoyer", async () => {
    const sendMessage = vi.fn(() => true);
    mockUseChat.mockReturnValue({ ...chatConnecte, sendMessage });
    render(<ChatWindow onClose={onClose} />);

    const textarea = screen.getByRole("textbox", { name: /saisir un message/i });
    await userEvent.type(textarea, "Mon message");
    fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));

    expect(sendMessage).toHaveBeenCalledWith("Mon message");
  });

  it("envoie le message via Enter (sans Shift)", async () => {
    const sendMessage = vi.fn(() => true);
    mockUseChat.mockReturnValue({ ...chatConnecte, sendMessage });
    render(<ChatWindow onClose={onClose} />);

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "Test Enter");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(sendMessage).toHaveBeenCalledWith("Test Enter");
  });

  it("ne vide pas l'input si sendMessage retourne false (WS déconnecté)", async () => {
    mockUseChat.mockReturnValue({
      ...chatConnecte,
      connected: false,
      sendMessage: vi.fn(() => false),
    });
    render(<ChatWindow onClose={onClose} />);

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "Message perdu");

    // Button is disabled when not connected
    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  it("bouton d'envoi désactivé si input vide", () => {
    render(<ChatWindow onClose={onClose} />);
    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  it("bouton d'envoi désactivé si non connecté", () => {
    mockUseChat.mockReturnValue({ ...chatConnecte, connected: false });
    render(<ChatWindow onClose={onClose} />);
    // Button stays disabled even with text because !connected
    expect(screen.getByRole("button", { name: /envoyer/i })).toBeDisabled();
  });

  it("affiche le statut de connexion via sr-only", () => {
    render(<ChatWindow onClose={onClose} />);
    expect(screen.getByText("Connecté")).toBeInTheDocument();
  });

  it("affiche 'Connexion en cours' quand connecting=true", () => {
    mockUseChat.mockReturnValue({ ...chatConnecte, connected: false, connecting: true });
    render(<ChatWindow onClose={onClose} />);
    expect(screen.getByText("Connexion en cours")).toBeInTheDocument();
  });

  it("appelle markRead à l'ouverture", () => {
    const markRead = vi.fn();
    mockUseChat.mockReturnValue({ ...chatConnecte, markRead });
    render(<ChatWindow onClose={onClose} />);
    expect(markRead).toHaveBeenCalled();
  });

  it("la zone de messages a aria-live=polite", () => {
    render(<ChatWindow onClose={onClose} />);
    const list = screen.getByRole("list", { name: /messages du chat/i });
    expect(list).toHaveAttribute("aria-live", "polite");
  });

  it("ne crée pas de message sur Shift+Enter", async () => {
    const sendMessage = vi.fn(() => true);
    mockUseChat.mockReturnValue({ ...chatConnecte, sendMessage });
    render(<ChatWindow onClose={onClose} />);

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "Saut de ligne");
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("vide l'input après envoi réussi", async () => {
    mockUseChat.mockReturnValue({ ...chatConnecte, sendMessage: vi.fn(() => true) });
    render(<ChatWindow onClose={onClose} />);

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "Message envoyé");
    fireEvent.click(screen.getByRole("button", { name: /envoyer/i }));

    await waitFor(() => expect(textarea.value).toBe(""));
  });
});
