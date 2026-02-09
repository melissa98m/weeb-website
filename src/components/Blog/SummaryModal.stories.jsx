import React from "react";
import { MemoryRouter } from "react-router-dom";
import SummaryModal from "./SummaryModal";
import Button from "../Button";

const samplePost = {
  id: "tokyo-ink",
  title: "Tokyo Ink: Dessiner la nuit",
  title_fr: "Tokyo Ink: Dessiner la nuit",
  excerpt:
    "A short dive into neon alleys, brush strokes, and the artists who keep the city awake.",
  excerpt_fr:
    "Une plongée dans les ruelles au néon, les coups de pinceau et les artistes qui gardent la ville éveillée.",
  author: "Yuki Tanaka",
  date: "2024-11-12",
  cover: "/weeb.svg",
  _genres: [
    { id: "g1", name: "Art", color: "#F97316" },
    { id: "g2", name: "Culture", color: "#38BDF8" },
  ],
};

const translations = {
  author_label: "Auteur :",
  date_label: "Date :",
  genres_label: "Genres :",
  reading_time_label: "Temps de lecture :",
  minutes_label: "min",
  summary_title: "Resume",
  key_points: "Points cles",
  close: "Fermer",
  read_more: "Lire la suite",
};

const meta = {
  title: "Components/SummaryModal",
  component: SummaryModal,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="min-h-screen bg-slate-50 text-gray-900">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark"],
    },
    language: {
      control: "radio",
      options: ["fr", "en"],
    },
  },
  args: {
    open: true,
    post: samplePost,
    theme: "light",
    language: "fr",
    t: translations,
    onClose: () => {},
  },
};

export default meta;

export const Static = {};

export const Dark = {
  args: {
    theme: "dark",
  },
};

export const Interactive = {
  render: (args) => {
    const [open, setOpen] = React.useState(true);
    return (
      <div className="min-h-screen p-6 bg-slate-50">
        <Button
          type="button"
          className="px-4 py-2 rounded-md bg-primary text-dark shadow"
          onClick={() => setOpen(true)}
        >
          Ouvrir le resume
        </Button>
        <SummaryModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
