import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

vi.mock("../context/LanguageContext", () => ({
  useLanguage: () => ({ language: "fr" }),
}));

vi.mock("../lib/seo", () => ({
  setCanonical: () => () => {},
  setOgMeta: () => () => {},
  setJsonLd: () => () => {},
  setHreflang: () => () => {},
  setTwitterMeta: () => () => {},
  SITE_URL: "https://weeb.melissa-mangione.com",
  DEFAULT_OG_IMAGE: "https://weeb.melissa-mangione.com/og-image.jpg",
}));

vi.mock("../components/Home/HeroSection", () => ({
  default: () => <div>HeroSection</div>,
}));

vi.mock("../components/Home/MarqueeSection", () => ({
  default: () => <div>MarqueeSection</div>,
}));

vi.mock("../components/Home/BentoGrid", () => ({
  default: () => <div>BentoGrid</div>,
}));

vi.mock("../components/Home/StepsSection", () => ({
  default: () => <div>StepsSection</div>,
}));

vi.mock("../components/Home/CtaFinal", () => ({
  default: () => <div>CtaFinal</div>,
}));

vi.mock("../components/Home/FeaturedArticle", () => ({
  default: () => <div>FeaturedArticle</div>,
}));

describe("Home page", () => {
  it("renders the main sections", async () => {
    render(<Home />);

    expect(screen.getByText("HeroSection")).toBeInTheDocument();
    expect(screen.getByText("MarqueeSection")).toBeInTheDocument();
    expect(screen.getByText("BentoGrid")).toBeInTheDocument();
    expect(screen.getByText("StepsSection")).toBeInTheDocument();
    expect(screen.getByText("CtaFinal")).toBeInTheDocument();
    expect(await screen.findByText("FeaturedArticle")).toBeInTheDocument();
  });
});
