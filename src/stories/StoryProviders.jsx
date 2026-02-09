import React from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { LanguageProvider } from "../context/LanguageContext";
import { AuthContext } from "../context/AuthContext";

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

export const buildMockAuth = ({ user = null, loading = false } = {}) => ({
  user,
  loading,
  error: null,
  login: async () => null,
  register: async () => null,
  logout: async () => null,
  reload: async () => null,
});

export function StoryProviders({ theme, language, auth, children }) {
  applyTheme(theme);
  applyLanguage(language);
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthContext.Provider value={auth}>
          {children}
        </AuthContext.Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
