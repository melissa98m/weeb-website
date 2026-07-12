import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "./HeroSection";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ initial: _i, animate: _a, transition: _t, ...rest }) => <div {...rest} />,
    h1: ({ initial: _i, animate: _a, transition: _t, ...rest }) => <h1 {...rest} />,
    p: ({ initial: _i, animate: _a, transition: _t, ...rest }) => <p {...rest} />,
    span: ({ initial: _i, animate: _a, transition: _t, ...rest }) => <span {...rest} />,
    img: ({ drag: _d, dragConstraints: _dc, dragDirectionLock: _ddl, dragTransition: _dt, dragElastic: _de, whileTap: _wt, initial: _i, animate: _a, transition: _t, ...rest }) => <img {...rest} />,
  },
  useReducedMotion: () => false,
}));

function renderHero() {
  return render(
    <MemoryRouter>
      <HeroSection />
    </MemoryRouter>
  );
}

describe("HeroSection", () => {
  it("rend un h1", () => {
    renderHero();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("contient le mot 'Web' dans le titre", () => {
    renderHero();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Web");
  });

  it("affiche un lien vers /blog", () => {
    renderHero();
    expect(
      screen.getAllByRole("link").find((l) => l.getAttribute("href") === "/blog")
    ).toBeInTheDocument();
  });

  it("affiche un lien vers /formations", () => {
    renderHero();
    expect(
      screen.getAllByRole("link").find((l) => l.getAttribute("href") === "/formations")
    ).toBeInTheDocument();
  });

  it("affiche l'image mockup avec un attribut alt", () => {
    renderHero();
    expect(screen.getByAltText("Interface Weeb — aperçu de la plateforme")).toBeInTheDocument();
  });

  it("est encapsulé dans une balise section", () => {
    const { container } = renderHero();
    expect(container.querySelector("section")).toBeInTheDocument();
  });
});
