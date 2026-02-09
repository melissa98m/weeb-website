import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Messages from "./Messages";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("../components/admin/AdminAccessFooter", () => ({
  default: () => <div>AdminAccessFooter</div>,
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Messages page", () => {
  it("renders no access when user is not staff", () => {
    useAuth.mockReturnValue({ user: { id: 1, groups: [] } });

    render(<Messages />);

    expect(screen.getByText("You are not allowed to access this page.")).toBeInTheDocument();
  });

  it("loads and marks message as processed", async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ user: { id: 1, is_staff: true } });

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 1,
              first_name: "Ada",
              last_name: "Lovelace",
              telephone: "123",
              email: "ada@example.com",
              subject: 3,
              message_content: "Hello",
              is_processed: false,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<Messages />);

    const names = await screen.findAllByText("Ada Lovelace");
    expect(names.length).toBeGreaterThan(0);

    const buttons = screen.getAllByRole("button", { name: "Mark as processed" });
    await user.click(buttons[0]);
    expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining("/messages/1/"), expect.objectContaining({ method: "PATCH" }));
  });
});
