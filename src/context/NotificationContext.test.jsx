import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { NotificationProvider, useNotifications } from "./NotificationContext";

// ─────────────────────────────────────────────
// Mocks
// ─────────────────────────────────────────────

vi.mock("../lib/api", () => ({
  API_BASE: "http://localhost:8000/api",
  WS_BASE: "ws://localhost:8000",
}));

vi.mock("../lib/cookies", () => ({
  getCookie: vi.fn(() => "csrftoken-test"),
}));

vi.mock("./AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "./AuthContext";

// ─────────────────────────────────────────────
// Fake WebSocket
// ─────────────────────────────────────────────

class FakeWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  constructor(url) {
    this.url = url;
    this.readyState = FakeWebSocket.OPEN;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
    this._sentMessages = [];
    FakeWebSocket.instances.push(this);
  }

  send(data) {
    this._sentMessages.push(JSON.parse(data));
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    if (this.onclose) this.onclose({});
  }

  // Test helper: simulate receiving a message from the server
  receive(data) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }
}

FakeWebSocket.instances = [];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

let ctxValue = null;

function Consumer() {
  ctxValue = useNotifications();
  return (
    <div>
      <span data-testid="count">{ctxValue.unreadCount}</span>
      <span data-testid="length">{ctxValue.notifications.length}</span>
    </div>
  );
}

function renderWithUser(user = { id: 1, email: "test@test.com" }) {
  useAuth.mockReturnValue({ user });
  return render(
    <NotificationProvider>
      <Consumer />
    </NotificationProvider>
  );
}

// ─────────────────────────────────────────────
// Setup / Teardown
// ─────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  FakeWebSocket.instances = [];
  ctxValue = null;
  global.WebSocket = FakeWebSocket;
  // Mock fetch so the async ws-ticket call resolves immediately (non-ok → no ticket, falls back to cookie)
  global.fetch = vi.fn().mockResolvedValue({ ok: false });
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────

describe("NotificationContext", () => {

  it("ouvre une connexion WebSocket quand l'utilisateur est connecté", async () => {
    renderWithUser();
    await act(async () => {});
    expect(FakeWebSocket.instances).toHaveLength(1);
    expect(FakeWebSocket.instances[0].url).toContain("/ws/notifications/");
  });

  it("n'ouvre pas de WebSocket si l'utilisateur est null", () => {
    useAuth.mockReturnValue({ user: null });
    render(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );
    expect(FakeWebSocket.instances).toHaveLength(0);
  });

  it("initialise les notifications depuis le frame 'init'", async () => {
    renderWithUser();
    await act(async () => {});
    const ws = FakeWebSocket.instances[0];

    act(() => {
      ws.receive({
        type: "init",
        notifications: [
          { id: 1, type: "info", message: "Notif A", read: false, created_at: "2025-01-01T00:00:00" },
          { id: 2, type: "inscription", message: "Notif B", read: true, created_at: "2025-01-02T00:00:00" },
        ],
      });
    });

    expect(screen.getByTestId("length").textContent).toBe("2");
    expect(screen.getByTestId("count").textContent).toBe("1"); // seulement la non lue
  });

  it("ajoute une notification depuis le frame 'notification'", async () => {
    renderWithUser();
    await act(async () => {});
    const ws = FakeWebSocket.instances[0];

    act(() => {
      ws.receive({
        type: "notification",
        notification: { id: 3, type: "info", message: "Nouvelle notif", read: false, created_at: "2025-01-03T00:00:00" },
      });
    });

    expect(screen.getByTestId("length").textContent).toBe("1");
    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  it("ignore les frames malformées (JSON invalide)", async () => {
    renderWithUser();
    await act(async () => {});
    const ws = FakeWebSocket.instances[0];

    act(() => {
      if (ws.onmessage) {
        ws.onmessage({ data: "{invalid json{{" });
      }
    });

    expect(screen.getByTestId("length").textContent).toBe("0");
  });

  it("markRead envoie un ACK via WebSocket et met à jour l'état", async () => {
    renderWithUser();
    await act(async () => {});
    const ws = FakeWebSocket.instances[0];

    act(() => {
      ws.receive({
        type: "init",
        notifications: [
          { id: 1, type: "info", message: "Test", read: false, created_at: "2025-01-01T00:00:00" },
        ],
      });
    });

    act(() => {
      ctxValue.markRead(1);
    });

    expect(ws._sentMessages).toContainEqual({ type: "ack", id: 1 });
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("markAllRead effectue un POST API et remet unreadCount à 0", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    renderWithUser();
    await act(async () => {});
    const ws = FakeWebSocket.instances[0];

    act(() => {
      ws.receive({
        type: "init",
        notifications: [
          { id: 1, type: "info", message: "A", read: false, created_at: "2025-01-01T00:00:00" },
          { id: 2, type: "info", message: "B", read: false, created_at: "2025-01-02T00:00:00" },
        ],
      });
    });

    await act(async () => {
      await ctxValue.markAllRead();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications/read-all/"),
      expect.objectContaining({ method: "POST" })
    );
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("markAllRead est silencieux en cas d'erreur réseau", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
    renderWithUser();

    await act(async () => {
      await ctxValue.markAllRead();
    });

    // No exception thrown
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("remet les notifications à zéro quand l'utilisateur se déconnecte", async () => {
    const { rerender } = renderWithUser();
    await act(async () => {});
    const ws = FakeWebSocket.instances[0];

    act(() => {
      ws.receive({
        type: "init",
        notifications: [
          { id: 1, type: "info", message: "Test", read: false, created_at: "2025-01-01T00:00:00" },
        ],
      });
    });

    expect(screen.getByTestId("length").textContent).toBe("1");

    // Sign out
    useAuth.mockReturnValue({ user: null });
    rerender(
      <NotificationProvider>
        <Consumer />
      </NotificationProvider>
    );

    expect(screen.getByTestId("length").textContent).toBe("0");
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("tente une reconnexion automatique après fermeture du WebSocket", async () => {
    renderWithUser();
    await act(async () => {});
    const ws = FakeWebSocket.instances[0];

    act(() => {
      ws.close();
    });

    // Avancer le timer de reconnexion (5000ms) et attendre le connect async
    await act(async () => {
      vi.advanceTimersByTime(5100);
    });

    expect(FakeWebSocket.instances.length).toBeGreaterThanOrEqual(2);
  });
});
