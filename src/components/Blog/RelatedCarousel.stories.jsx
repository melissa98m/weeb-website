import React from "react";
import { MemoryRouter } from "react-router-dom";
import RelatedCarousel from "./RelatedCarousel";

const meta = {
  title: "Components/Blog/RelatedCarousel",
  component: RelatedCarousel,
  parameters: { layout: "fullscreen" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
  },
  args: {
    theme: "light",
    language: "fr",
    currentId: 999,
    currentGenres: [
      { id: 1, name: "Art", color: "#F97316" },
      { id: 2, name: "Culture", color: "#38BDF8" },
    ],
  },
};

export default meta;

export const Default = {
  render: (args) => (
    <MemoryRouter>
      <div className="min-h-screen p-6 bg-slate-50">
        <RelatedCarousel {...args} />
      </div>
    </MemoryRouter>
  ),
};
