import React from "react";
import { MemoryRouter } from "react-router-dom";
import FormationModal from "./FormationModal";
import Button from "../Button";

const formation = {
  id: 1,
  name: "React Masterclass",
  description:
    "Une formation complete pour maitriser React, hooks, patterns et performance.",
};

const labels = {
  close: "Fermer",
  contact_us: "Nous contacter",
};

const meta = {
  title: "Components/Formations/FormationModal",
  component: FormationModal,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: {
    open: true,
    formation,
    theme: "light",
    t: labels,
    onClose: () => {},
  },
};

export default meta;

export const Static = {};

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
          Ouvrir la formation
        </Button>
        <FormationModal {...args} open={open} onClose={() => setOpen(false)} />
      </div>
    );
  },
};
