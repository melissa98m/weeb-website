import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Blog from "./Blog";
import blogEn from "../../locales/en/blog.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("../lib/seo", () => ({
  setCanonical: () => () => {},
  setOgMeta: () => () => {},
  setHreflang: () => () => {},
  setJsonLd: () => () => {},
  setTwitterMeta: () => () => {},
  SITE_URL: "https://weeb.melissa-mangione.com",
  DEFAULT_OG_IMAGE: "https://weeb.melissa-mangione.com/og-image.jpg",
}));

vi.mock("framer-motion", () => ({
  motion: {
    header: (props) => <header {...props} />,
    div: (props) => <div {...props} />,
    article: ({ initial: _i, animate: _a, transition: _t, ...rest }) => <article {...rest} />,
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

vi.mock("../components/Blog/BlogCard", () => ({
  default: ({ post }) => <div>{post.title}</div>,
}));

vi.mock("../components/Blog/GenreChips", () => ({
  default: ({ genres, onChange }) => (
    <div>
      {genres.map((g) => (
        <button key={g.id ?? "all"} onClick={() => onChange(g.id)}>
          {g.name}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("../components/ui/Pagination", () => ({
  default: () => <div>Pagination</div>,
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Blog page", () => {
  it("loads and displays posts", async () => {
    // First call: genres
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{ id: 10, name: "Tech" }] }),
    });
    // Second call: articles
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            title: "Post One",
            article_content: "Hello world",
            author: "Ada",
            created_at: "2024-01-01",
            genres: [{ id: 10, name: "Tech" }],
          },
        ],
        count: 1,
        next: null,
      }),
    });

    render(<MemoryRouter><Blog /></MemoryRouter>);

    expect(await screen.findByText("Post One")).toBeInTheDocument();
  });

  it("shows empty state when no posts", async () => {
    // First call: genres
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    });
    // Second call: articles
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], count: 0, next: null }),
    });

    render(<MemoryRouter><Blog /></MemoryRouter>);

    expect(await screen.findByText(blogEn.empty)).toBeInTheDocument();
  });
});
