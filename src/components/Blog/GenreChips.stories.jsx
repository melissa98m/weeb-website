import React from "react";
import GenreChips from "./GenreChips";

const genres = [
  { id: 1, name: "Art", color: "#F97316" },
  { id: 2, name: "Culture", color: "#38BDF8" },
  { id: 3, name: "Design", color: "#A78BFA" },
];

const meta = {
  title: "Components/Blog/GenreChips",
  component: GenreChips,
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: {
    genres,
    theme: "light",
  },
};

export default meta;

export const Interactive = {
  render: (args) => {
    const [selectedId, setSelectedId] = React.useState(null);
    return (
      <div className="space-y-2">
        <GenreChips {...args} selectedId={selectedId} onChange={setSelectedId} />
        <div className="text-sm text-gray-600">
          Selection: {selectedId ?? "—"}
        </div>
      </div>
    );
  },
};
