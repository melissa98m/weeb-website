import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Formations from "./Formations";
import formationsEn from "../../locales/en/formations.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("framer-motion", () => ({
  motion: {
    header: (props) => <header {...props} />,
    div: (props) => <div {...props} />,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useReducedMotion: () => false,
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../components/Formations/FormationCard", () => ({
  default: ({ f, onView }) => (
    <button type="button" onClick={() => onView(f)}>
      {f.name}
    </button>
  ),
}));

vi.mock("../components/Formations/FormationModal", () => ({
  default: ({ open, formation }) => (open ? <div>Modal: {formation?.name}</div> : null),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Formations page", () => {
  it("renders list and opens modal", async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ id: 1, name: "React", description: "Basics" }] }),
    });

    render(<Formations />);

    expect(await screen.findByRole("button", { name: "React" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "React" }));
    expect(await screen.findByText("Modal: React")).toBeInTheDocument();
  });

  it("shows empty state when none", async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) });

    render(<Formations />);

    expect(await screen.findByText(formationsEn.empty)).toBeInTheDocument();
  });
});
