import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_NAME,
  deleteCookie,
  getCookie,
  setCookie,
} from "../lib/cookies";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import cookiesFr from "../../locales/fr/cookies.json";
import cookiesEn from "../../locales/en/cookies.json";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [preferences, setPreferences] = useState({ optional: false });
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? cookiesFr : cookiesEn;

  useEffect(() => {
    const consent = getCookie(COOKIE_CONSENT_NAME);
    if (consent) {
      let parsed = null;
      if (consent === "accepted") {
        parsed = { optional: true };
      } else if (consent === "rejected") {
        parsed = { optional: false };
      } else {
        try {
          const json = JSON.parse(consent);
          if (json && typeof json.optional === "boolean") {
            parsed = { optional: json.optional };
          }
        } catch (_) {
          parsed = null;
        }
      }
      const finalPrefs = parsed ?? { optional: false };
      setPreferences(finalPrefs);
      setHasConsent(true);
      setVisible(false);
    } else {
      setHasConsent(false);
      setVisible(true);
    }
  }, []);

  const saveConsent = (nextPreferences) => {
    setCookie(COOKIE_CONSENT_NAME, JSON.stringify(nextPreferences));
    setPreferences(nextPreferences);
    setHasConsent(true);
    setVisible(false);
  };

  const containerClasses =
    theme === "dark"
      ? "bg-[#0b1220] border-slate-700 text-slate-100"
      : "bg-white border-slate-200 text-slate-900";
  const subtleText = theme === "dark" ? "text-slate-300" : "text-slate-600";
  const primaryBtn =
    theme === "dark"
      ? "bg-white text-slate-900 hover:bg-slate-200"
      : "bg-slate-900 text-white hover:bg-slate-800";
  const secondaryBtn =
    theme === "dark"
      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
      : "bg-slate-100 text-slate-900 hover:bg-slate-200";

  const manageBtnClasses =
    theme === "dark"
      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
      : "bg-slate-900 text-white hover:bg-slate-800";

  const handleManage = () => {
    setVisible(true);
  };

  const handleAcceptAll = () => {
    saveConsent({ optional: true });
  };

  const handleRejectAll = () => {
    saveConsent({ optional: false });
  };

  const handleSave = () => {
    saveConsent(preferences);
  };

  const handleReset = () => {
    deleteCookie(COOKIE_CONSENT_NAME);
    setHasConsent(false);
    setVisible(true);
  };

  if (!visible && !hasConsent) return null;

  return (
    <>
      {visible && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
          <div
            className={`mx-auto max-w-4xl rounded-2xl border p-4 shadow-xl ${containerClasses}`}
            role="dialog"
            aria-live="polite"
            aria-label="Consentement aux cookies"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm leading-relaxed">
                <p className="font-semibold">{t.title}</p>
                <p className={`${subtleText}`}>
                  {t.description}
                </p>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {t.required_title}
                  </p>
                  <div className="flex items-center justify-between rounded-xl border border-dashed px-3 py-2 opacity-70">
                    <div>
                      <p className="font-semibold">{t.required_label}</p>
                      <p className={`${subtleText}`}>
                        {t.required_desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="h-4 w-4 accent-slate-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {t.optional_title}
                  </p>
                  <div className="flex items-center justify-between rounded-xl border px-3 py-2">
                    <div>
                      <p className="font-semibold">{t.optional_label}</p>
                      <p className={`${subtleText}`}>
                        {t.optional_desc}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.optional}
                      onChange={(event) =>
                        setPreferences((prev) => ({
                          ...prev,
                          optional: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleRejectAll}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${secondaryBtn}`}
              >
                {t.reject}
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${primaryBtn}`}
              >
                {t.accept_all}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${primaryBtn}`}
              >
                {t.save}
              </button>
              {hasConsent && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition text-slate-500 hover:text-slate-400"
                >
                  {t.remove_choice}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {!visible && hasConsent && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            type="button"
            onClick={handleManage}
            className={`rounded-full p-3 shadow-lg transition ${manageBtnClasses}`}
            aria-label={t.manage_button}
            title={t.manage_button}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2a10 10 0 1 0 9.95 11c-2.05.72-4.63.24-6.01-1.14a4.5 4.5 0 0 1-1.25-4.27 3.5 3.5 0 0 1-4.32-4.32A4.5 4.5 0 0 1 5.7 2.05 9.94 9.94 0 0 0 12 2zm-4.5 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm4-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 3.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-2.5 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
