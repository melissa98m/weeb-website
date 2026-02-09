import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import PageSizer from "./PageSizer";

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
  title: "Components/PageSizer",
  component: PageSizer,
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
  },
  args: {
    theme: "light",
    pageSize: 20,
  },
};

export default meta;

export const Interactive = {
  render: (args) => {
    const [size, setSize] = React.useState(args.pageSize);
    return (
      <div className="space-y-2">
        <PageSizer {...args} pageSize={size} onChange={setSize} />
        <div className="text-sm text-gray-600">Page size: {size}</div>
      </div>
    );
  },
};

export const Dark = {
  args: {
    theme: "dark",
    pageSize: 50,
  },
};
