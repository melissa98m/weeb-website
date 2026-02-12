import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import { AuthApi, ensureCsrf } from "../lib/api";

vi.mock("../lib/api", () => ({
  AuthApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
  ensureCsrf: vi.fn(),
}));

let ctx;
function Consumer() {
  ctx = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.name ?? ctx.user.id : "none"}</span>
      {ctx.error ? <span data-testid="error">error</span> : null}
      <button type="button" onClick={() => ctx.login({ email: " user@test.com ", password: "pw" })}>
        login
      </button>
      <button
        type="button"
        onClick={() => ctx.register({ email: "new@test.com", password: "pw" })}
      >
        register
      </button>
      <button type="button" onClick={() => ctx.logout().catch(() => {})}>
        logout
      </button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    ctx = null;
    vi.clearAllMocks();
    ensureCsrf.mockResolvedValue("token");
    AuthApi.me.mockResolvedValue(null);
    AuthApi.login.mockResolvedValue({});
    AuthApi.register.mockResolvedValue({});
    AuthApi.logout.mockResolvedValue({});

    window.requestIdleCallback = (cb) => {
      cb();
      return 1;
    };
    window.cancelIdleCallback = () => {};
    window.history.pushState({}, "", "/");
    delete window.Cypress;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("throws when used outside provider", () => {
    function Bad() {
      useAuth();
      return null;
    }

    expect(() => render(<Bad />)).toThrow(/useAuth must be used within <AuthProvider>/);
  });

  it("loads user on protected path", async () => {
    window.history.pushState({}, "", "/profile");
    AuthApi.me.mockResolvedValueOnce({ id: 1, name: "A" });

    renderAuth();

    await waitFor(() => expect(AuthApi.me).toHaveBeenCalled());
    expect(ensureCsrf).toHaveBeenCalled();
    expect(screen.getByTestId("user").textContent).toBe("A");
  });

  it("login trims identifier and updates user", async () => {
    const user = userEvent.setup();
    AuthApi.me
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 2, name: "B" });

    renderAuth();

    await user.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("B"));
    expect(AuthApi.login).toHaveBeenCalledWith({
      login: "user@test.com",
      password: "pw",
    });
  });

  it("register calls register then login and updates user", async () => {
    const user = userEvent.setup();
    AuthApi.me
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 3, name: "C" });

    renderAuth();

    await user.click(screen.getByRole("button", { name: "register" }));

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("C"));
    expect(AuthApi.register).toHaveBeenCalledWith({
      email: "new@test.com",
      password: "pw",
    });
    expect(AuthApi.login).toHaveBeenCalledWith({
      login: "new@test.com",
      password: "pw",
    });
  });

  it("clears user on logout even when api fails", async () => {
    const user = userEvent.setup();
    AuthApi.me.mockResolvedValueOnce({ id: 4, name: "D" });
    AuthApi.logout.mockRejectedValueOnce(new Error("fail"));

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("D"));
    await user.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("none"));
  });

  it("sets error when /me fails", async () => {
    AuthApi.me.mockRejectedValueOnce(new Error("boom"));

    renderAuth();

    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("error")).toBeInTheDocument();
  });
});
