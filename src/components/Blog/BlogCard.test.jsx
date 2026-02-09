import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogCard from "./BlogCard";

vi.mock("framer-motion", () => ({
  motion: {
    article: (props) => <article {...props} />,
    div: (props) => <div {...props} />,
  },
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
  it("renders content and triggers summary", async () => {
    const user = userEvent.setup();
    const onViewSummary = vi.fn();

    render(
      <BlogCard
        post={post}
        language="en"
        theme="light"
        onViewSummary={onViewSummary}
        labels={{ viewSummary: "View summary" }}
      />
    );

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Short text")).toBeInTheDocument();
    expect(screen.getByText("Tech")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View summary" }));
    expect(onViewSummary).toHaveBeenCalledWith(post);
  });
});
