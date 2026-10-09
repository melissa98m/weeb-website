import React, { useState } from "react";
import FiltersBar from "./FiltersBar";
import { ThemeProvider } from "../../context/ThemeContext";

const USER_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "1", label: "alice" },
  { value: "2", label: "bob" },
  { value: "3", label: "charlie" },
];

const FORMATION_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "1", label: "React Avancé" },
  { value: "2", label: "Python Débutant" },
  { value: "3", label: "Docker & Kubernetes" },
];

function withTheme(theme = "light") {
  return (Story) => {
    if (typeof document !== "undefined") {
      localStorage.setItem("theme", theme);
      document.documentElement.dataset.theme = theme;
    }
    return (
      <ThemeProvider>
        <div className="p-6">
          <Story />
        </div>
      </ThemeProvider>
    );
  };
}

function InteractiveFiltersBar(args) {
  const [filterUser, setFilterUser] = useState("");
  const [filterFormation, setFilterFormation] = useState("");
  const [searchUser, setSearchUser] = useState("");
  return (
    <FiltersBar
      {...args}
      filterUser={filterUser}
      setFilterUser={setFilterUser}
      filterFormation={filterFormation}
      setFilterFormation={setFilterFormation}
      searchUser={searchUser}
      setSearchUser={setSearchUser}
    />
  );
}

const meta = {
  title: "Admin/FiltersBar",
  component: FiltersBar,
  parameters: { layout: "fullscreen" },
};

export default meta;

export const Default = {
  decorators: [withTheme("light")],
  render: (args) => <InteractiveFiltersBar {...args} />,
  args: {
    userOptions: USER_OPTIONS,
    formationOptions: FORMATION_OPTIONS,
  },
};

export const DarkTheme = {
  decorators: [withTheme("dark")],
  render: (args) => <InteractiveFiltersBar {...args} />,
  args: {
    userOptions: USER_OPTIONS,
    formationOptions: FORMATION_OPTIONS,
  },
  parameters: { backgrounds: { default: "dark" } },
};
