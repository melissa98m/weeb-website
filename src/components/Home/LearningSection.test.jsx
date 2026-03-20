import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LearningSection from "./LearningSection";

vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    img: ({ initial: _i, whileInView: _wiv, viewport: _vp, transition: _tr, ...rest }) => <img {...rest} />,
  },
}));

function renderSection() {
  return render(
    <MemoryRouter>
      <LearningSection />
    </MemoryRouter>
  );
}

describe("LearningSection", () => {
  it("rend un h2", () => {
    renderSection();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("affiche un lien vers /formations", () => {
    renderSection();
    expect(
      screen.getAllByRole("link").find((l) => l.getAttribute("href") === "/formations")
    ).toBeInTheDocument();
  });

  it("affiche l'image mockup avec un attribut alt", () => {
    renderSection();
    expect(screen.getByAltText("Mockup 2")).toBeInTheDocument();
  });

  it("est encapsulé dans une balise section", () => {
    const { container } = renderSection();
    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("affiche un sous-titre uppercase", () => {
    renderSection();
    // Le h3 est affiché en uppercase via CSS mais le texte vient du JSON
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });
});
