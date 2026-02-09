import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustedBy from "./TrustedBy";
import homeEn from "../../../locales/en/home.json";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

vi.mock("../Icon/Artvenue", () => ({ default: () => <div>Artvenue</div> }));
vi.mock("../Icon/Shells", () => ({ default: () => <div>Shells</div> }));
vi.mock("../Icon/Smartfinder", () => ({ default: () => <div>Smartfinder</div> }));
vi.mock("../Icon/Waves", () => ({ default: () => <div>Waves</div> }));
vi.mock("../Icon/Zoomerr", () => ({ default: () => <div>Zoomerr</div> }));

vi.mock("../../context/ThemeContext", () => ({
  useTheme: vi.fn(),
}));

vi.mock("../../context/LanguageContext", () => ({
  useLanguage: vi.fn(),
}));

beforeEach(() => {
  useTheme.mockReset();
  useLanguage.mockReset();
  useTheme.mockReturnValue({ theme: "dark" });
  useLanguage.mockReturnValue({ language: "en" });
});

describe("TrustedBy", () => {
  it("renders heading and lazy-loaded logos", async () => {
    render(<TrustedBy />);

    expect(screen.getByRole("heading", { name: homeEn.trust })).toBeInTheDocument();

    expect(await screen.findByText("Artvenue")).toBeInTheDocument();
    expect(await screen.findByText("Shells")).toBeInTheDocument();
    expect(await screen.findByText("Smartfinder")).toBeInTheDocument();
    expect(await screen.findByText("Waves")).toBeInTheDocument();
    expect(await screen.findByText("Zoomerr")).toBeInTheDocument();
  });
});
