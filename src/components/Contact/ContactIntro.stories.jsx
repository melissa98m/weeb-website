import React from "react";
import ContactIntro from "./ContactIntro";
import { LanguageProvider } from "../../context/LanguageContext";
import { ThemeProvider } from "../../context/ThemeContext";

const applyLanguage = (language) => {
  if (typeof document === "undefined") return;
  localStorage.setItem("language", language);
  document.documentElement.setAttribute("lang", language);
  document.documentElement.dataset.lang = language;
};

const Providers = ({ language, children }) => {
  applyLanguage(language);
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
};

const meta = {
  title: "Sections/ContactIntro",
  component: ContactIntro,
  decorators: [
    (Story, context) => (
      <Providers {...context.args}>
        <div className="min-h-screen bg-slate-50 text-gray-900">
          <Story />
        </div>
      </Providers>
    ),
  ],
  parameters: { layout: "fullscreen" },
  argTypes: {
    language: { control: "radio", options: ["fr", "en"] },
  },
  args: {
    language: "fr",
  },
};

export default meta;

export const Default = {};

export const English = {
  args: {
    language: "en",
  },
};
