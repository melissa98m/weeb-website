import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import Select from "./Select";

const ThemeFrame = ({ theme, children }) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.dataset.theme = theme;
  }
  return <ThemeProvider>{children}</ThemeProvider>;
};

const baseOptions = [
  { value: "tokyo", label: "Tokyo" },
  { value: "osaka", label: "Osaka" },
  { value: "kyoto", label: "Kyoto" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  decorators: [
    (Story, context) => (
      <ThemeFrame theme={context.args.theme}>
        <div className="p-6 max-w-sm">
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
  },
  args: {
    theme: "light",
    placeholder: "Choisir une ville",
    options: baseOptions,
    disabled: false,
  },
};

export default meta;

export const Interactive = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value ?? "");
    return (
      <div className="space-y-2">
        <Select {...args} value={value} onChange={setValue} />
        <div className="text-sm text-gray-600">Valeur: {value || "—"}</div>
      </div>
    );
  },
  args: {
    value: "",
  },
};

export const Disabled = {
  args: {
    disabled: true,
    value: "tokyo",
  },
};
