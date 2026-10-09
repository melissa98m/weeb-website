import React from "react";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "./SearchBar";
import { ThemeProvider } from "../context/ThemeContext";

function withProviders(theme = "light") {
  return (Story) => {
    // Pre-apply the theme so ThemeProvider picks it up
    if (typeof document !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.dataset.theme = theme;
    }
    return (
      <ThemeProvider>
        <MemoryRouter>
          <div className="p-6 flex justify-center">
            <Story />
          </div>
        </MemoryRouter>
      </ThemeProvider>
    );
  };
}

const meta = {
  title: "Components/SearchBar",
  component: SearchBar,
  parameters: { layout: "fullscreen" },
};

export default meta;

/** Closed state — shows the trigger button */
export const Closed = {
  decorators: [withProviders("light")],
};

export const ClosedDark = {
  decorators: [withProviders("dark")],
};
