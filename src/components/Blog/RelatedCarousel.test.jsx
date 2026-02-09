import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RelatedCarousel from "./RelatedCarousel";

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("RelatedCarousel", () => {
  it("returns null when no genres", () => {
    const { container } = render(
      <MemoryRouter>
        <RelatedCarousel currentId={1} currentGenres={[]} theme="light" language="en" />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders related items", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { id: 2, title: "Post 2", genres: [{ id: 5, name: "Tech", color: "#000" }] },
          { id: 3, title: "Post 3", genres: [{ id: 5, name: "Tech", color: "#000" }] },
        ],
        next: null,
      }),
    });

    render(
      <MemoryRouter>
        <RelatedCarousel
          currentId={1}
          currentGenres={[{ id: 5, name: "Tech" }]}
          theme="light"
          language="en"
        />
      </MemoryRouter>
    );

    expect(await screen.findByText("Post 2")).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links.some((l) => l.getAttribute("href") === "/blog/2")).toBe(true);
    expect(links.some((l) => l.getAttribute("href") === "/blog/3")).toBe(true);
  });
});
