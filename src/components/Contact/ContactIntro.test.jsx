import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactIntro from "./ContactIntro";
import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

beforeEach(() => {
  useLanguage.mockReset();
  useTheme.mockReturnValue({ theme: "light" });
});

describe("ContactIntro", () => {
  it("renders English content when language is en", () => {
    useLanguage.mockReturnValue({ language: "en" });

    render(<ContactIntro />);

    expect(
      screen.getByRole("heading", { name: contactEn.contact_title })
    ).toBeInTheDocument();
    expect(screen.getByText(contactEn.contact_intro)).toBeInTheDocument();
  });

  it("renders French content when language is fr", () => {
    useLanguage.mockReturnValue({ language: "fr" });

    render(<ContactIntro />);

    expect(
      screen.getByRole("heading", { name: contactFr.contact_title.trim() })
    ).toBeInTheDocument();
    expect(screen.getByText(contactFr.contact_intro.trim())).toBeInTheDocument();
  });
});
