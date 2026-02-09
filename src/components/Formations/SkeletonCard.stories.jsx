import React from "react";
import SkeletonCard from "./SkeletonCard";

const meta = {
  title: "Components/Formations/SkeletonCard",
  component: SkeletonCard,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-sm">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
  },
  args: {
    theme: "light",
  },
};

export default meta;

export const Default = {};

export const Dark = {
  args: {
    theme: "dark",
  },
};
