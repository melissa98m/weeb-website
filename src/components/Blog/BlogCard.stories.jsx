import React from "react";
import BlogCard from "./BlogCard";

const post = {
  id: 1,
  title: "Tokyo Ink: Dessiner la nuit",
  title_fr: "Tokyo Ink: Dessiner la nuit",
  excerpt:
    "A short dive into neon alleys, brush strokes, and the artists who keep the city awake.",
  excerpt_fr:
    "Une plongee dans les ruelles au neon, les coups de pinceau et les artistes qui gardent la ville eveillee.",
  cover: "/weeb.svg",
  author: "Yuki Tanaka",
  created_at: "2024-11-12",
  _genres: [
    { id: 1, name: "Art", color: "#F97316" },
    { id: 2, name: "Culture", color: "#38BDF8" },
  ],
};

const meta = {
  title: "Components/Blog/BlogCard",
  component: BlogCard,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-sm">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
  },
  args: {
    post,
    theme: "light",
    language: "fr",
    labels: { viewSummary: "Voir le resume" },
    onViewSummary: () => {},
  },
};

export default meta;

export const Default = {};

export const Dark = {
  args: {
    theme: "dark",
  },
};
