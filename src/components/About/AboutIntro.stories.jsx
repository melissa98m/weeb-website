import React from "react";
import AboutIntro from "./AboutIntro";
import { ThemeProvider } from "../../context/ThemeContext";
import { LanguageProvider } from "../../context/LanguageContext";

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  localStorage.setItem("theme", theme);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.dataset.theme = theme;
};

const applyLanguage = (language) => {
  if (typeof document === "undefined") return;
  localStorage.setItem("language", language);
  document.documentElement.setAttribute("lang", language);
  document.documentElement.dataset.lang = language;
};

const Providers = ({ theme, language, children }) => {
  applyTheme(theme);
  applyLanguage(language);
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
};

const meta = {
  title: "Sections/AboutIntro",
  component: AboutIntro,
  decorators: [
    (Story, context) => (
      <Providers {...context.args}>
        <div className="min-h-screen bg-slate-50">
          <Story />
        </div>
      </Providers>
    ),
  ],
  parameters: { layout: "fullscreen" },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
  },
  args: {
    theme: "dark",
    language: "fr",
  },
};

export default meta;

export const Default = {};

export const Light = {
  args: {
    theme: "light",
  },
};
