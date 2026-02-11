import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Feedbacks from "./Feedbacks";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("../components/admin/AdminAccessFooter", () => ({
  default: () => <div>AdminAccessFooter</div>,
}));

vi.mock("../components/ui/PageSizer", () => ({
  default: ({ pageSize }) => <div>PageSizer {pageSize}</div>,
}));

vi.mock("../components/ui/Pagination", () => ({
  default: () => <div>Pagination</div>,
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

vi.mock("../lib/api", () => ({
  ensureCsrf: vi.fn().mockResolvedValue("token"),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Feedbacks page", () => {
  it("renders no access when user is not staff", () => {
    useAuth.mockReturnValue({ user: { id: 1, groups: [] } });

    render(<Feedbacks />);

    expect(screen.getByText("You are not allowed to access this page.")).toBeInTheDocument();
  });

  it("loads feedbacks and marks processed", async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ user: { id: 1, is_staff: true } });

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: 7,
              user: { id: 1, first_name: "Ada", last_name: "Lovelace", email: "ada@example.com" },
              formation: { id: 9, name: "React" },
              feedback_content: "Great",
              satisfaction: 1,
              confidence: 0.9,
              to_process: false,
            },
          ],
          count: 1,
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<Feedbacks />);

    const names = await screen.findAllByText("Ada Lovelace");
    expect(names.length).toBeGreaterThan(0);
    expect(screen.getAllByText("React").length).toBeGreaterThan(0);

    const buttons = screen.getAllByRole("button", { name: "Mark as processed" });
    await user.click(buttons[0]);
    expect(fetch).toHaveBeenLastCalledWith(expect.stringContaining("/feedbacks/7/"), expect.objectContaining({ method: "PATCH" }));
  });
});
