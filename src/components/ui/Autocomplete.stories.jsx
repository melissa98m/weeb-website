import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import Autocomplete from "./Autocomplete";

const ThemeFrame = ({ theme, children }) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    document.documentElement.dataset.theme = theme;
  }
  return <ThemeProvider>{children}</ThemeProvider>;
};

const dataset = [
  { id: "akihabara", label: "Akihabara" },
  { id: "shibuya", label: "Shibuya" },
  { id: "shinjuku", label: "Shinjuku" },
  { id: "asakusa", label: "Asakusa" },
  { id: "ueno", label: "Ueno" },
  { id: "gion", label: "Gion" },
  { id: "nakano", label: "Nakano" },
];

const meta = {
  title: "Components/Autocomplete",
  component: Autocomplete,
  decorators: [
    (Story, context) => (
      <ThemeFrame theme={context.args.theme}>
        <div className="p-6 max-w-md">
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
    id: "city-search",
    placeholder: "Rechercher un quartier",
    minSearchLength: 2,
    debounceMs: 200,
  },
};

export default meta;

export const Interactive = {
  render: (args) => {
    const [value, setValue] = React.useState(null);

    const fetchOptions = async (query) => {
      const q = query.toLowerCase();
      return dataset.filter((item) => item.label.toLowerCase().includes(q));
    };

    return (
      <div className="space-y-2">
        <Autocomplete {...args} value={value} onChange={setValue} fetchOptions={fetchOptions} />
        <div className="text-sm text-gray-600">
          Selection: {value || "—"}
        </div>
      </div>
    );
  },
};

export const Disabled = {
  args: {
    disabled: true,
  },
};
