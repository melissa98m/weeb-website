import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import Pill from "./Pill";

const ThemeFrame = ({ theme, children }) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.dataset.theme = theme;
  }
  return <ThemeProvider>{children}</ThemeProvider>;
};

const meta = {
  title: "Components/Pill",
  component: Pill,
  decorators: [
    (Story, context) => (
      <ThemeFrame theme={context.args.theme}>
        <div className="p-6">
          <Story />
        </div>
      </ThemeFrame>
    ),
  ],
  argTypes: {
    theme: {
      control: "radio",
      options: ["light", "dark"],
    },
    color: {
      control: "select",
      options: ["neutral", "primary", "success", "warning", "danger", "info"],
    },
    variant: {
      control: "select",
      options: ["soft", "solid", "outline"],
    },
    size: {
      control: "radio",
      options: ["sm", "md"],
    },
  },
  args: {
    theme: "light",
    color: "primary",
    variant: "soft",
    size: "sm",
    children: "Badge",
  },
};

export default meta;

export const Playground = {};

export const AllVariants = {
  render: (args) => {
    const colors = ["neutral", "primary", "success", "warning", "danger", "info"];
    const variants = ["soft", "solid", "outline"];
    return (
      <div className="space-y-3">
        {variants.map((variant) => (
          <div key={variant} className="flex flex-wrap gap-2 items-center">
            {colors.map((color) => (
              <Pill key={`${variant}-${color}`} {...args} variant={variant} color={color}>
                {color}
              </Pill>
            ))}
          </div>
        ))}
      </div>
    );
  },
  args: {
    theme: "light",
    size: "sm",
  },
};
