import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TrendsSection from "./TrendsSection";
import homeEn from "../../../locales/en/home.json";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReset();
  useLanguage.mockReset();
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
});

describe("TrendsSection", () => {
  it("renders text and blog link", () => {
    render(
      <MemoryRouter>
        <TrendsSection />
      </MemoryRouter>
    );

    expect(screen.getByText(homeEn.home_title_8)).toBeInTheDocument();
    expect(screen.getByText(homeEn.home_title_9)).toBeInTheDocument();

    const highlight = screen.getByText(homeEn.home_title_10);
    expect(highlight.className).toContain("text-secondary");

    const link = screen.getByRole("link", { name: homeEn.link_3 });
    expect(link).toHaveAttribute("href", "/blog");
  });
});
