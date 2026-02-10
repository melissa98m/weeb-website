import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { appEnv } from "./lib/env";
import { Analytics } from "@vercel/analytics/react";


const sentryDsn = appEnv.VITE_SENTRY_DSN;
const sentryEnabled = appEnv.PROD && Boolean(sentryDsn);

if (sentryEnabled) {
  const integrations = [];

  if (typeof Sentry.browserTracingIntegration === "function") {
    integrations.push(Sentry.browserTracingIntegration());
  } else if (typeof Sentry.browserTracing === "function") {
    integrations.push(Sentry.browserTracing());
  }

  if (typeof Sentry.replayIntegration === "function") {
    integrations.push(Sentry.replayIntegration());
  } else if (typeof Sentry.replay === "function") {
    integrations.push(Sentry.replay());
  }

  Sentry.init({
    dsn: sentryDsn,
    integrations,
    traces_sample_rate: 1.0,
    replays_session_sample_rate: 0.1,
    replays_on_error_sample_rate: 1.0,
  });
}

const appTree = (
  <BrowserRouter>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <App />
          <Analytics />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {sentryEnabled ? (
      <Sentry.ErrorBoundary fallback={<div>Une erreur est survenue.</div>}>
        {appTree}
      </Sentry.ErrorBoundary>
    ) : (
      appTree
    )}
  </StrictMode>
);
