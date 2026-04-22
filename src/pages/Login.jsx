import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage, getApiLockoutMessage, getApiRetryAfter, getEnabledOAuthProviders } from "../lib/api";
import { appEnv } from "../lib/env";
import Button from "../components/Button";
import loginEn from "../../locales/en/login.json";
import loginFr from "../../locales/fr/login.json";

export default function Login() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const identifierRef = useRef(null);
  const shakeTimeoutRef = useRef(null);
  const oauthProviders = getEnabledOAuthProviders().filter((provider) => provider.id !== "google");
  const hasGoogleOAuth = Boolean(appEnv.VITE_GOOGLE_CLIENT_ID?.trim());
  const hasAnyOAuth = hasGoogleOAuth || oauthProviders.length > 0;
  const oauthGoogle = (idToken) => loginWithGoogle({ idToken });

  const L = language === "fr" ? loginFr : loginEn;

  // ⚠️ identifiant libre (email OU username)
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockUntilTs, setLockUntilTs] = useState(0);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);

  // SEO
  useEffect(() => {
    const prev = document.title;
    document.title = language === "fr" ? "Connexion | Weeb" : "Login | Weeb";
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = prev;
      if (metaRobots) metaRobots.setAttribute("content", "index, follow");
    };
  }, [language]);

  // Focus sur le premier champ au montage
  useEffect(() => {
    if (identifierRef.current) {
      identifierRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  // Sync local lock timer from backend retry_after.
  useEffect(() => {
    if (!lockUntilTs) {
      setRemainingLockSeconds(0);
      return;
    }
    const updateRemaining = () => {
      const remain = Math.max(0, Math.ceil((lockUntilTs - Date.now()) / 1000));
      setRemainingLockSeconds(remain);
      if (remain <= 0) {
        setLockUntilTs(0);
      }
    };
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [lockUntilTs]);

  const isLocked = remainingLockSeconds > 0;

  const validate = () => {
    const errs = {};
    if (!form.identifier.trim()) {
      errs.identifier = language === "fr" ? "Identifiant requis." : "Identifier is required.";
    }
    if (!form.password.trim()) {
      errs.password = L.password_error || "Password is required.";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: null, form: null }));
  };

  const handleOAuthLogin = (url) => {
    if (typeof window === "undefined") return;
    window.location.assign(url);
  };

  const triggerShake = () => {
    setShake(true);
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    shakeTimeoutRef.current = setTimeout(() => {
      shakeTimeoutRef.current = null;
      setShake(false);
    }, 500);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const oauthErrorMessage =
      language === "fr"
        ? "Connexion Google impossible pour le moment."
        : "Google sign-in is currently unavailable.";

    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) {
        setErrors({ form: oauthErrorMessage });
        triggerShake();
        return;
      }

      setSubmitting(true);
      const me = await oauthGoogle(idToken);
      if (me) {
        setLockUntilTs(0);
        navigate(from, { replace: true });
      } else {
        setErrors({ form: oauthErrorMessage });
        triggerShake();
      }
    } catch (e) {
      const apiMsg = getApiErrorMessage(e, oauthErrorMessage);
      setErrors({ form: apiMsg });
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({
      form:
        language === "fr"
          ? "Connexion Google annulée ou indisponible."
          : "Google sign-in was cancelled or unavailable.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if the account is locked
    if (isLocked) {
      setErrors({
        form: language === "fr" 
          ? `Trop de tentatives. Réessayez dans ${remainingLockSeconds}s.`
          : `Too many attempts. Retry in ${remainingLockSeconds}s.`
      });
      return;
    }

    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      triggerShake();
      return;
    }

    try {
      setSubmitting(true);
      const id = form.identifier.trim();
      console.debug("[LOGIN] submit with id=", id);

      const me = await login({
        identifier: id,
        password: form.password,
      });

      if (me) {
        setLockUntilTs(0);
        navigate(from, { replace: true });
      } else {
        throw new Error("no_me");
      }
    } catch (e) {
      console.error("[LOGIN] error:", e);

      if (e?.status === 429) {
        const retryAfter = getApiRetryAfter(e) ?? 30;
        setLockUntilTs(Date.now() + retryAfter * 1000);
        setErrors({
          form: getApiLockoutMessage(e, language, retryAfter),
        });
      } else {
        const apiMsg = getApiErrorMessage(
          e,
          language === "fr" ? "Identifiants invalides." : "Invalid credentials."
        );
        setErrors({ form: apiMsg });
      }

      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full p-3 rounded-md border focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-500 focus:ring-red-400 focus:border-red-500"
        : theme === "dark"
        ? "bg-surface border-border text-white focus:ring-primary focus:border-primary"
        : "bg-white border-gray-300 text-gray-900 focus:ring-secondary focus:border-secondary"
    } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`;

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-12 ${
        theme === "dark" ? "text-white bg-background" : "text-background bg-light"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`w-full p-8 rounded-lg border shadow-lg space-y-6 ${
            theme === "dark" ? "bg-[#C084FC1A] border-primary" : "bg-white border-secondary shadow-xl"
          }`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-center mb-2">{L.login || "Login"}</h1>
            <p className={`text-center text-sm ${theme === "dark" ? "text-muted" : "text-gray-600"}`}>
              {language === "fr" 
                ? "Connectez-vous à votre compte" 
                : "Sign in to your account"}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm rounded-md p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700"
                role="alert"
                aria-live="polite"
              >
                {errors.form}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Identifier (email OU username) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label htmlFor="identifier" className="block font-medium mb-2">
              {language === "fr" ? "Email ou nom d'utilisateur" : "Email or username"}
            </label>
            <input
              ref={identifierRef}
              type="text"
              id="identifier"
              autoComplete="username email"
              value={form.identifier}
              onChange={handleChange}
              disabled={isLocked}
              className={fieldClass(!!errors.identifier)}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? "identifier-error" : undefined}
              placeholder={language === "fr" ? "exemple@email.com" : "example@email.com"}
            />
            {errors.identifier && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="identifier-error"
                className="mt-1 text-xs text-red-500"
                role="alert"
              >
                {errors.identifier}
              </motion.p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="password" className="block font-medium mb-2">
              {L.password || "Password"}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                disabled={isLocked}
                className={`${fieldClass(!!errors.password)} pr-12`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-sm transition-colors ${
                  theme === "dark"
                    ? "text-muted hover:text-primary"
                    : "text-gray-500 hover:text-secondary"
                } ${isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"} focus:outline-none focus:ring-2 focus:ring-primary rounded`}
                aria-label={showPassword 
                  ? (language === "fr" ? "Masquer le mot de passe" : "Hide password")
                  : (language === "fr" ? "Afficher le mot de passe" : "Show password")
                }
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="password-error"
                className="mt-1 text-xs text-red-500"
                role="alert"
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              disabled={submitting || isLocked}
              className={`w-full px-4 py-3 rounded-md shadow-md text-sm font-medium transition-all ${
                theme === "dark"
                  ? "bg-secondary text-white hover:bg-secondary/90 focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-background"
                  : "bg-primary text-dark hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-light"
              } ${submitting || isLocked ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"}`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {language === "fr" ? "Connexion..." : "Signing in..."}
                </span>
              ) : (
                L.login || "Login"
              )}
            </Button>
          </motion.div>

          {hasAnyOAuth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="space-y-3"
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <p
                  className={`relative mx-auto w-fit px-2 text-xs ${
                    theme === "dark" ? "bg-surface text-muted" : "bg-white text-gray-500"
                  }`}
                >
                  {L.or_continue_with || "Or continue with"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {hasGoogleOAuth && (
                  <GoogleOAuthProvider clientId={appEnv.VITE_GOOGLE_CLIENT_ID.trim()}>
                    <div
                      className={`overflow-hidden rounded-md border shadow-sm transition-all ${
                        theme === "dark"
                          ? "border-gray-700 bg-surface hover:border-gray-600"
                          : "border-gray-300 bg-white hover:border-gray-400"
                      } focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2`}
                    >
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="continue_with"
                        shape="rectangular"
                        size="large"
                        width="100%"
                        theme={theme === "dark" ? "filled_black" : "outline"}
                        logo_alignment="left"
                        use_fedcm_for_button
                      />
                    </div>
                  </GoogleOAuthProvider>
                )}
                {oauthProviders.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleOAuthLogin(provider.url)}
                    className={`w-full rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                      theme === "dark"
                        ? "border-gray-700 bg-surface text-white hover:bg-surface-3"
                        : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {provider.id === "github"
                      ? L.oauth_github || "Continue with GitHub"
                      : `${L.login || "Login"} ${provider.label}`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs space-y-3 pt-2"
          >
            <Link
              to="/forgot-password"
              className={`block transition-colors ${
                theme === "dark"
                  ? "text-muted hover:text-primary"
                  : "text-gray-600 hover:text-secondary"
              }`}
            >
              {L.forgot_password || "Forgot your password?"}
            </Link>
            <p className={`${theme === "dark" ? "text-muted" : "text-gray-600"}`}>
              {L.no_account || "No account yet?"}{" "}
              <Link
                to="/register"
                className={`font-medium underline underline-offset-4 transition-colors ${
                  theme === "dark"
                    ? "text-white hover:text-primary"
                    : "text-background hover:text-secondary"
                }`}
              >
                {L.create_account || "Create one"}
              </Link>
            </p>
          </motion.div>
        </motion.form>
      </motion.div>
    </section>
  );
}
