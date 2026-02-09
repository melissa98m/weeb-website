import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import About from "./About";
import aboutEn from "../../locales/en/about.json";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

vi.mock("framer-motion", () => ({
  motion: {
    div: (props) => <div {...props} />,
    h2: (props) => <h2 {...props} />,
    h3: (props) => <h3 {...props} />,
    p: (props) => <p {...props} />,
  },
}));

vi.mock("../components/About/AboutIntro", () => ({
  default: () => <div>AboutIntro</div>,
}));

vi.mock("../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReturnValue({ theme: "light" });
  useLanguage.mockReturnValue({ language: "en" });
});

describe("About page", () => {
  it("renders sections and CTA links", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    expect(screen.getByText("AboutIntro")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: aboutEn.mission_title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: aboutEn.vision_title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: aboutEn.values_title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: aboutEn.team_title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: aboutEn.cta_title })).toBeInTheDocument();

    expect(screen.getByRole("link", { name: aboutEn.cta_blog })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: aboutEn.cta_formations })).toHaveAttribute("href", "/formations");
    expect(screen.getByRole("link", { name: aboutEn.cta_contact })).toHaveAttribute("href", "/contact");
  });
});
