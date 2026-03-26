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

vi.mock("../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

vi.mock("../lib/seo", () => ({
  setCanonical: () => () => {},
  setOgMeta: () => () => {},
  setHreflang: () => () => {},
  SITE_URL: "https://weeb.melissa-mangione.com",
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
