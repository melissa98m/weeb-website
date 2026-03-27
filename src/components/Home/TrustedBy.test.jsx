import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustedBy from "./TrustedBy";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "dark" });
  useLanguage.mockReturnValue({ language: "en" });

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  const mockObserver = { observe: vi.fn(), disconnect: vi.fn() };
  class MockIntersectionObserver {
    constructor() { return mockObserver; }
  }
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

describe("TrustedBy", () => {
  it("renders heading and lazy-loaded logos", () => {
    render(<TrustedBy />);

    expect(screen.getByRole("region", { name: /weeb in numbers/i })).toBeInTheDocument();
  });

  it("displays all metric labels", () => {
    render(<TrustedBy />);

    expect(screen.getByText("articles published")).toBeInTheDocument();
    expect(screen.getByText("courses available")).toBeInTheDocument();
    expect(screen.getByText("active learners")).toBeInTheDocument();
  });

  it("shows metric labels in French when language is fr", () => {
    useLanguage.mockReturnValue({ language: "fr" });
    render(<TrustedBy />);

    expect(screen.getByText("articles publiés")).toBeInTheDocument();
    expect(screen.getByText("formations disponibles")).toBeInTheDocument();
    expect(screen.getByText("apprenants actifs")).toBeInTheDocument();
  });
});
