import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutIntro from "./AboutIntro";
import aboutEn from "../../../locales/en/about.json";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

vi.mock("framer-motion", () => ({
  motion: {
    h1: (props) => <h1 {...props} />,
    p: (props) => <p {...props} />,
  },
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

beforeEach(() => {
  useLanguage.mockReset();
  useTheme.mockReset();
});

describe("AboutIntro", () => {
  it("renders English content and dark theme styles", () => {
    useLanguage.mockReturnValue({ language: "en" });
    useTheme.mockReturnValue({ theme: "dark" });

    render(<AboutIntro />);

    const title = screen.getByRole("heading", { name: aboutEn.about_title });
    expect(title).toBeInTheDocument();
    expect(title.className).toContain("text-white");

    const subtitle = screen.getByText(aboutEn.about_subtitle);
    expect(subtitle).toBeInTheDocument();
    expect(subtitle.className).toContain("text-white/80");
  });
});
