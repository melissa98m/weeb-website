import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import registerEn from "../../locales/en/register.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

vi.mock("framer-motion", () => ({
  motion: {
    form: (props) => <form {...props} />,
    div: (props) => <div {...props} />,
    p: (props) => <p {...props} />,
    li: (props) => <li {...props} />,
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
  useAuth.mockReturnValue({ register: vi.fn() });
});

describe("Register", () => {
  it("shows validation errors for empty submit", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: registerEn.register }));

    expect(await screen.findByText(registerEn.username_error)).toBeInTheDocument();
    expect(screen.getByText(registerEn.name_error)).toBeInTheDocument();
    expect(screen.getByText(registerEn.firstname_error)).toBeInTheDocument();
    expect(screen.getByText(registerEn.email_error)).toBeInTheDocument();
    expect(screen.getByText(registerEn.phone_required)).toBeInTheDocument();
    expect(screen.getByText(registerEn.password_error)).toBeInTheDocument();
    expect(screen.getByText(registerEn.confirm_password_required)).toBeInTheDocument();
    expect(screen.getByText(registerEn.rgpd_consent_error)).toBeInTheDocument();
  });

  it("submits valid data", async () => {
    const user = userEvent.setup();
    const register = vi.fn().mockResolvedValue({ id: 1 });
    useAuth.mockReturnValue({ register });

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(registerEn.username), "jdoe");
    await user.type(screen.getByLabelText(registerEn.name), "Doe");
    await user.type(screen.getByLabelText(registerEn.firstname), "Jane");
    await user.type(screen.getByLabelText(registerEn.email), "jane@example.com");
    await user.type(screen.getByLabelText(registerEn.phone), "+33123456789");
    await user.type(screen.getByLabelText(registerEn.password), "Abcd1234!");
    await user.type(screen.getByLabelText(registerEn.confirm_password), "Abcd1234!");
    await user.click(screen.getByRole("checkbox", { name: registerEn.rgpd_consent }));

    await user.click(screen.getByRole("button", { name: registerEn.register }));

    expect(register).toHaveBeenCalledWith({
      username: "jdoe",
      email: "jane@example.com",
      first_name: "Jane",
      last_name: "Doe",
      phone: "+33123456789",
      password: "Abcd1234!",
    });
  });
});
