import React from "react";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "./HeroSection";
import { StoryProviders, buildMockAuth } from "../../stories/StoryProviders";

const meta = {
  title: "Sections/Home/HeroSection",
  component: HeroSection,
  parameters: { layout: "fullscreen" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
  },
  args: {
    theme: "dark",
    language: "fr",
  },
};

export default meta;

export const Default = {
  render: (args) => {
    const auth = buildMockAuth({ user: null });
    return (
      <StoryProviders theme={args.theme} language={args.language} auth={auth}>
        <MemoryRouter>
          <div className="min-h-screen bg-slate-50">
            <HeroSection />
          </div>
        </MemoryRouter>
      </StoryProviders>
    );
  },
};
