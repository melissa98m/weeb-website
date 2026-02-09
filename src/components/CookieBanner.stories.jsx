import React from "react";
import CookieBanner from "./CookieBanner";
import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
import { COOKIE_CONSENT_NAME } from "../lib/cookies";

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

const applyConsent = (consent, optional) => {
  if (typeof document === "undefined") return;
  if (consent === "none") {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }
  if (consent === "accepted" || consent === "rejected") {
    document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(consent)}; Path=/; SameSite=Lax`;
    return;
  }
  if (consent === "custom") {
    const payload = JSON.stringify({ optional: Boolean(optional) });
    document.cookie = `${COOKIE_CONSENT_NAME}=${encodeURIComponent(payload)}; Path=/; SameSite=Lax`;
  }
};

const Providers = ({ theme, language, consent, optional, children }) => {
  applyTheme(theme);
  applyLanguage(language);
  applyConsent(consent, optional);
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
};

const meta = {
  title: "Components/CookieBanner",
  component: CookieBanner,
  decorators: [
    (Story, context) => (
      <Providers {...context.args}>
        <div className="min-h-screen bg-slate-50" />
        <Story />
      </Providers>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    theme: { control: "radio", options: ["light", "dark"] },
    language: { control: "radio", options: ["fr", "en"] },
    consent: {
      control: "radio",
      options: ["none", "accepted", "rejected", "custom"],
    },
    optional: { control: "boolean" },
  },
  args: {
    theme: "dark",
    language: "fr",
    consent: "none",
    optional: false,
  },
};

export default meta;

export const NewVisitor = {};

export const ConsentGiven = {
  args: {
    consent: "accepted",
  },
};

export const CustomConsent = {
  args: {
    consent: "custom",
    optional: true,
  },
};
