import React from "react";
import { MemoryRouter } from "react-router-dom";
import SearchBar from "./SearchBar";
import { ThemeProvider } from "../context/ThemeContext";

function withProviders(theme = "light") {
  return (Story) => {
    // Pré-applique le thème pour ThemeProvider
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

/** État fermé — affiche le bouton déclencheur */
export const Closed = {
  decorators: [withProviders("light")],
};

export const ClosedDark = {
  decorators: [withProviders("dark")],
};
