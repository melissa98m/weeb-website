import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BlogCard from "./BlogCard";

vi.mock("framer-motion", () => ({
  motion: {
    article: ({ layout: _l, initial: _i, animate: _a, exit: _e, transition: _t, ...rest }) => <article {...rest} />,
    div: (props) => <div {...props} />,
  },
  useReducedMotion: () => false,
}));

const post = {
  id: 1,
  title: "Hello",
  excerpt: "Short text",
  cover: "/img.jpg",
  author: "Ada",
  created_at: "2024-01-01",
  _genres: [{ id: 1, name: "Tech", color: "#ff0000" }],
};

describe("BlogCard", () => {
  it("renders content", () => {
    render(
      <MemoryRouter>
        <BlogCard post={post} language="en" theme="light" />
      </MemoryRouter>
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getAllByText("Short text").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Tech")).toBeInTheDocument();
  });

  it("links to the article detail page", () => {
    render(
      <MemoryRouter>
        <BlogCard post={post} language="en" theme="light" />
      </MemoryRouter>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/1");
  });
});
