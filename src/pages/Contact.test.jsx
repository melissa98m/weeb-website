import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Contact from "./Contact";
import { useTheme } from "../context/ThemeContext";

vi.mock("../components/Contact/ContactIntro", () => ({
  default: () => <div>ContactIntro</div>,
}));

vi.mock("../components/Contact/ContactForm", () => ({
  default: () => <div>ContactForm</div>,
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
});

describe("Contact page", () => {
  it("renders intro and form", () => {
    render(<Contact />);

    expect(screen.getByText("ContactIntro")).toBeInTheDocument();
    expect(screen.getByText("ContactForm")).toBeInTheDocument();
  });
});
