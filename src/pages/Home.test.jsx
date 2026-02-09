import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

vi.mock("../components/Home/HeroSection", () => ({
  default: () => <div>HeroSection</div>,
}));

vi.mock("../components/Home/LearningSection", () => ({
  default: () => <div>LearningSection</div>,
}));

vi.mock("../components/Home/TrendsSection", () => ({
  default: () => <div>TrendsSection</div>,
}));

vi.mock("../components/Home/TrustedBy", () => ({
  default: () => <div>TrustedBy</div>,
}));

describe("Home page", () => {
  it("renders the main sections", async () => {
    render(<Home />);

    expect(screen.getByText("HeroSection")).toBeInTheDocument();
    expect(screen.getByText("LearningSection")).toBeInTheDocument();
    expect(screen.getByText("TrendsSection")).toBeInTheDocument();
    expect(await screen.findByText("TrustedBy")).toBeInTheDocument();
  });
});
