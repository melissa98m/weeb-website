import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "./ResetPassword";
import resetEn from "../../locales/en/reset_password.json";
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
    confirmPasswordReset: vi.fn(),
  },
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  AuthApi.confirmPasswordReset.mockReset();
});

describe("ResetPassword", () => {
  it("disables submit when uid or token is missing", () => {
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const submit = screen.getByRole("button", { name: resetEn.submit });
    expect(submit).toBeDisabled();
  });

  it("submits when valid and shows success", async () => {
    const user = userEvent.setup();
    AuthApi.confirmPasswordReset.mockResolvedValue({ ok: true });

    render(
      <MemoryRouter initialEntries={["/reset?uid=abc&token=def"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(resetEn.password_label), "Abcd1234!");
    await user.type(screen.getByLabelText(resetEn.confirm_label), "Abcd1234!");
    await user.click(screen.getByRole("button", { name: resetEn.submit }));

    expect(AuthApi.confirmPasswordReset).toHaveBeenCalledWith({
      uid: "abc",
      token: "def",
      password: "Abcd1234!",
      password_confirm: "Abcd1234!",
    });

    expect(await screen.findByText(resetEn.success_message)).toBeInTheDocument();
  });
});
