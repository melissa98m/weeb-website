import React from "react";
import Footer from "./Footer";
import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";

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
  title: "Components/Footer",
  component: Footer,
  decorators: [
    (Story, context) => (
      <Providers {...context.args}>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <div className="flex-1" />
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
