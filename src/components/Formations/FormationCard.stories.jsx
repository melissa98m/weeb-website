import React from "react";
import FormationCard from "./FormationCard";

const sampleFormation = {
  id: 1,
  name: "React Masterclass",
  description:
    "Une formation complete pour maitriser React, hooks, patterns et performance.",
};

const meta = {
  title: "Components/Formations/FormationCard",
  component: FormationCard,
  decorators: [
    (Story, context) => (
      <div className="p-6 max-w-sm">
        <Story {...context} />
      </div>
    ),
  ],
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: {
    theme: "light",
    f: sampleFormation,
    onView: () => {},
  },
};

export default meta;

export const Default = {};

export const Dark = {
  args: {
    theme: "dark",
  },
};
