import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import "highlight.js/styles/github-dark-dimmed.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { appEnv } from "./lib/env";
import { Analytics } from "@vercel/analytics/react";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";


const sentryDsn = appEnv.VITE_SENTRY_DSN;
const sentryEnabled = appEnv.PROD && Boolean(sentryDsn);

// RGPD : Sentry n'est initialisé qu'après vérification du consentement optional
// Le cookie cookie_consent est lu de manière synchrone avant tout rendu
function hasCookieConsent() {
  try {
    const raw = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("cookie_consent="));
    if (!raw) return false;
    const val = decodeURIComponent(raw.split("=").slice(1).join("="));
    if (val === "accepted") return true;
    if (val === "rejected") return false;
    const parsed = JSON.parse(val);
    return parsed?.optional === true;
  } catch {
    return false;
  }
}

if (sentryEnabled && hasCookieConsent()) {
  const integrations = [];

  if (typeof Sentry.browserTracingIntegration === "function") {
    integrations.push(Sentry.browserTracingIntegration());
  }

  Sentry.init({
    dsn: sentryDsn,
    integrations,
    traces_sample_rate: 1.0,
    // Session replay désactivé — risque PII (RGPD)
    replays_session_sample_rate: 0,
    replays_on_error_sample_rate: 0,
  });
}

const appTree = (
  <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <App />
            {/* RGPD : Vercel Analytics uniquement si consentement optional accordé */}
            {hasCookieConsent() && <Analytics />}
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>{appTree}</AppErrorBoundary>
  </StrictMode>
);
