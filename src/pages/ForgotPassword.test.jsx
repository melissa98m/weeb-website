import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPassword from "./ForgotPassword";
import { MemoryRouter } from "react-router-dom";
import forgotEn from "../../locales/en/forgot_password.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { AuthApi } from "../lib/api";

vi.mock("framer-motion", () => ({
  motion: {
    form: (props) => <form {...props} />,
  },
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  AuthApi: {
    requestPasswordReset: vi.fn(),
  },
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  AuthApi.requestPasswordReset.mockReset();
});

describe("ForgotPassword", () => {
  it("validates email and shows errors", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: forgotEn.submit }));
    expect(await screen.findByText(forgotEn.email_required)).toBeInTheDocument();

    await user.type(screen.getByLabelText(forgotEn.email_label), "bad");
    await user.click(screen.getByRole("button", { name: forgotEn.submit }));
    expect(await screen.findByText(forgotEn.email_invalid)).toBeInTheDocument();
  });

  it("submits and shows success message", async () => {
    const user = userEvent.setup();
    AuthApi.requestPasswordReset.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(forgotEn.email_label), "user@example.com");
    await user.click(screen.getByRole("button", { name: forgotEn.submit }));

    expect(AuthApi.requestPasswordReset).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(await screen.findByText(forgotEn.success_message)).toBeInTheDocument();
  });
});
