import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";
import blogEn from "../../locales/en/blog.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("framer-motion", () => ({
  motion: {
    header: (props) => <header {...props} />,
    div: (props) => <div {...props} />,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../components/Blog/BlogCard", () => ({
  default: ({ post, onViewSummary }) => (
    <button type="button" onClick={() => onViewSummary(post)}>
      {post.title}
    </button>
  ),
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

vi.mock("../components/Blog/SummaryModal", () => ({
  default: ({ open, post }) => (open ? <div>Summary: {post?.title}</div> : null),
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
  it("loads posts and opens summary modal", async () => {
    const user = userEvent.setup();

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
        next: null,
      }),
    });

    render(<Blog />);

    expect(await screen.findByRole("button", { name: "Post One" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Post One" }));
    expect(await screen.findByText("Summary: Post One")).toBeInTheDocument();
  });

  it("shows empty state when no posts", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [], next: null }),
    });

    render(<Blog />);

    expect(await screen.findByText(blogEn.empty)).toBeInTheDocument();
  });
});
