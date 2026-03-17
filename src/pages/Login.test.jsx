import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import loginEn from "../../locales/en/login.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getEnabledOAuthProviders } from "../lib/api";

vi.mock("framer-motion", () => ({
  motion: {
    form: (props) => <form {...props} />,
    div: (props) => <div {...props} />,
    p: (props) => <p {...props} />,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }) => (
    <button type="button" onClick={() => onSuccess?.({ credential: "google-id-token" })}>
      Continue with Google
    </button>
  ),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  getEnabledOAuthProviders: vi.fn(),
  getApiErrorMessage: vi.fn((error, fallback) => error?.details?.detail || fallback),
  getApiLockoutMessage: vi.fn((error, language, fallbackSeconds = 30) =>
    language === "fr"
      ? `Trop de tentatives. Réessayez dans ${error?.details?.retry_after ?? fallbackSeconds}s.`
      : `Too many attempts. Retry in ${error?.details?.retry_after ?? fallbackSeconds}s.`
  ),
  getApiRetryAfter: vi.fn((error) => error?.details?.retry_after ?? null),
}));

vi.mock("../lib/env", () => ({
  appEnv: {
    VITE_GOOGLE_CLIENT_ID: "google-client-id",
  },
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  useAuth.mockReturnValue({ login: vi.fn(), loginWithGoogle: vi.fn() });
  getEnabledOAuthProviders.mockReturnValue([]);
});

describe("Login", () => {
  it("validates empty form", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: loginEn.login }));
    expect(await screen.findByText("Identifier is required.")).toBeInTheDocument();
    expect(screen.getByText(loginEn.password_error)).toBeInTheDocument();
  });

  it("calls login with identifier and password", async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue({ id: 1 });
    useAuth.mockReturnValue({ login, loginWithGoogle: vi.fn() });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email or username/i), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123!");
    await user.click(screen.getByRole("button", { name: loginEn.login }));

    expect(login).toHaveBeenCalledWith({
      identifier: "user@example.com",
      password: "secret123!",
    });
  });

  it("shows backend retry_after message on 429", async () => {
    const user = userEvent.setup();
    const err = new Error("too many");
    err.status = 429;
    err.details = { detail: "too many login attempts", retry_after: 12 };
    const login = vi.fn().mockRejectedValue(err);
    useAuth.mockReturnValue({ login, loginWithGoogle: vi.fn() });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email or username/i), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123!");
    await user.click(screen.getByRole("button", { name: loginEn.login }));

    await waitFor(() =>
      expect(screen.getByText("Too many attempts. Retry in 12s.")).toBeInTheDocument()
    );
  });

  it("calls loginWithGoogle when Google auth succeeds", async () => {
    const user = userEvent.setup();
    const loginWithGoogle = vi.fn().mockResolvedValue({ id: 2 });
    useAuth.mockReturnValue({ login: vi.fn(), loginWithGoogle });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(loginWithGoogle).toHaveBeenCalledWith({ idToken: "google-id-token" });
  });

  it("redirects to provider URL when non-google oauth button is clicked", async () => {
    const user = userEvent.setup();
    getEnabledOAuthProviders.mockReturnValue([
      { id: "github", label: "GitHub", url: "https://auth.example.com/github" },
    ]);
    const assignSpy = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign: assignSpy });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Continue with GitHub" }));
    expect(assignSpy).toHaveBeenCalledWith("https://auth.example.com/github");
    vi.unstubAllGlobals();
  });
});
