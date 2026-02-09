import React from "react";
import { ThemeProvider } from "../../context/ThemeContext";
import Artvenue from "./Artvenue";
import Shells from "./Shells";
import Smartfinder from "./Smartfinder";
import Waves from "./Waves";
import Zoomerr from "./Zoomerr";

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  localStorage.setItem("theme", theme);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.dataset.theme = theme;
};

const ThemeFrame = ({ theme, children }) => {
  applyTheme(theme);
  return <ThemeProvider>{children}</ThemeProvider>;
};

const meta = {
  title: "Components/Icons",
  decorators: [
    (Story, context) => (
      <ThemeFrame theme={context.args.theme}>
        <div className="p-6 bg-white text-gray-900">
          <Story />
        </div>
      </ThemeFrame>
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

export const Gallery = {
  render: () => (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Artvenue</div>
        <Artvenue />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Shells</div>
        <Shells />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Smartfinder</div>
        <Smartfinder />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Waves</div>
        <Waves />
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Zoomerr</div>
        <Zoomerr />
      </div>
    </div>
  ),
};
