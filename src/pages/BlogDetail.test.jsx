import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import BlogDetail from "./BlogDetail";
import blogEn from "../../locales/en/blog.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

vi.mock("framer-motion", () => ({
  motion: {
    div: (props) => <div {...props} />,
    h1: (props) => <h1 {...props} />,
    p: (props) => <p {...props} />,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
  useScroll: () => ({ scrollYProgress: 0 }),
  useSpring: (v) => v,
  useReducedMotion: () => false,
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

vi.mock("../components/Blog/RelatedCarousel", () => ({
  default: () => <div>RelatedCarousel</div>,
}));

let writeTextMock;

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  useAuth.mockReturnValue({ user: null, isAuthenticated: false });
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal("scrollTo", vi.fn());
  writeTextMock = vi.fn().mockResolvedValue();
  Object.defineProperty(globalThis, "navigator", {
    value: {
      ...globalThis.navigator,
      clipboard: { writeText: writeTextMock },
    },
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BlogDetail page", () => {
  it("renders article content and copy link", async () => {
    const user = userEvent.setup();
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [], count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          title: "Post One",
          article_content: "Paragraph one.\n\nParagraph two.",
          author: "Ada",
          created_at: "2024-01-01",
          genres: [{ id: 10, name: "Tech", color: "#000" }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: [{ id: 1 }], next: null }),
      });

    render(
      <MemoryRouter initialEntries={["/blog/1"]}>
        <Routes>
          <Route path="/blog/:id" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: "Post One" })).toBeInTheDocument();
    expect(screen.getByText("Paragraph one.")).toBeInTheDocument();
    expect(screen.getByText("Paragraph two.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: blogEn.copy_link }));
    expect(await screen.findByText(blogEn.copied)).toBeInTheDocument();
  });

  it("renders not found state on error", async () => {
    fetch
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    render(
      <MemoryRouter initialEntries={["/blog/2"]}>
        <Routes>
          <Route path="/blog/:id" element={<BlogDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(blogEn.not_found_title)).toBeInTheDocument();
  });
});
