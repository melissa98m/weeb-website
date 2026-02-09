import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import loginEn from "../../locales/en/login.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

vi.mock("framer-motion", () => ({
  motion: {
    form: (props) => <form {...props} />,
    div: (props) => <div {...props} />,
    p: (props) => <p {...props} />,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
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

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  useAuth.mockReturnValue({ login: vi.fn() });
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
    useAuth.mockReturnValue({ login });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email or username/i), "user@example.com");
    await user.type(screen.getByLabelText("Password"), "secret123!");
    await user.click(screen.getByRole("button", { name: loginEn.login }));

    expect(login).toHaveBeenCalledWith({
      email: "user@example.com",
      username: "user@example.com",
      identifier: "user@example.com",
      password: "secret123!",
    });
  });
});
