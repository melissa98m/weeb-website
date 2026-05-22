import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage, getApiLockoutMessage, getApiRetryAfter, getEnabledOAuthProviders } from "../lib/api";
import { appEnv } from "../lib/env";
import loginEn from "../../locales/en/login.json";
import loginFr from "../../locales/fr/login.json";

// ── SVG helpers ──────────────────────────────────────────────────────────────

function IconEyeOff() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconSpin() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Login() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const identifierRef = useRef(null);
  const shakeTimeoutRef = useRef(null);

  const oauthProviders = getEnabledOAuthProviders().filter((p) => p.id !== "google");
  const hasGoogleOAuth = Boolean(appEnv.VITE_GOOGLE_CLIENT_ID?.trim());
  const hasAnyOAuth = hasGoogleOAuth || oauthProviders.length > 0;
  const isDark = theme === "dark";

  const L = language === "fr" ? loginFr : loginEn;

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

  // Focus first field on mount
  useEffect(() => {
    identifierRef.current?.focus();
  }, []);

  // Cleanup shake timeout
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  // Lock countdown
  useEffect(() => {
    if (!lockUntilTs) { setRemainingLockSeconds(0); return; }
    const tick = () => {
      const remain = Math.max(0, Math.ceil((lockUntilTs - Date.now()) / 1000));
      setRemainingLockSeconds(remain);
      if (remain <= 0) setLockUntilTs(0);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lockUntilTs]);

  const isLocked = remainingLockSeconds > 0;

  const validate = () => {
    const errs = {};
    if (!form.identifier.trim())
      errs.identifier = language === "fr" ? "Identifiant requis." : "Identifier is required.";
    if (!form.password.trim())
      errs.password = L.password_error || "Password is required.";
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: null, form: null }));
  };

  const handleOAuthLogin = (url) => {
    if (typeof window !== "undefined") window.location.assign(url);
  };

  const triggerShake = () => {
    setShake(true);
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    shakeTimeoutRef.current = setTimeout(() => {
      shakeTimeoutRef.current = null;
      setShake(false);
    }, 500);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const fallback = language === "fr"
      ? "Connexion Google impossible pour le moment."
      : "Google sign-in is currently unavailable.";
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) { setErrors({ form: fallback }); triggerShake(); return; }
      setSubmitting(true);
      const me = await loginWithGoogle({ idToken });
      if (me) { setLockUntilTs(0); navigate(from, { replace: true }); }
      else { setErrors({ form: fallback }); triggerShake(); }
    } catch (e) {
      setErrors({ form: getApiErrorMessage(e, fallback) });
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({
      form: language === "fr"
        ? "Connexion Google annulée ou indisponible."
        : "Google sign-in was cancelled or unavailable.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      setErrors({
        form: language === "fr"
          ? `Trop de tentatives. Réessayez dans ${remainingLockSeconds}s.`
          : `Too many attempts. Retry in ${remainingLockSeconds}s.`,
      });
      return;
    }
    const validation = validate();
    if (Object.keys(validation).length) { setErrors(validation); triggerShake(); return; }

    try {
      setSubmitting(true);
      const me = await login({ identifier: form.identifier.trim(), password: form.password });
      if (me) { setLockUntilTs(0); navigate(from, { replace: true }); }
      else throw new Error("no_me");
    } catch (e) {
      if (e?.status === 429) {
        const retryAfter = getApiRetryAfter(e) ?? 30;
        setLockUntilTs(Date.now() + retryAfter * 1000);
        setErrors({ form: getApiLockoutMessage(e, language, retryAfter) });
      } else {
        setErrors({ form: getApiErrorMessage(e, language === "fr" ? "Identifiants invalides." : "Invalid credentials.") });
      }
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputBase = `w-full rounded-xl border px-3.5 py-3 bg-transparent text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
    isDark
      ? "border-border bg-surface/50 text-white placeholder-white/25 focus:border-primary/50"
      : "border-gray-200 bg-white text-dark placeholder-dark/30 focus:border-secondary/50"
  }`;
  const inputErr = "border-red-400/70 focus:border-red-400 focus:ring-red-400/20";
  const labelCls = `block text-xs font-medium mb-1.5 ${isDark ? "text-white/55" : "text-dark/55"}`;
  const disabledCls = isLocked ? "opacity-50 cursor-not-allowed" : "";

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center px-6 py-16 ${
        isDark ? "bg-background text-white" : "bg-light text-dark"
      }`}
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          style={{
            position: "absolute",
            top: "15%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "640px",
            height: "420px",
            background: isDark
              ? "radial-gradient(ellipse at center, rgba(192,132,252,0.08), transparent 70%)"
              : "radial-gradient(ellipse at center, rgba(147,51,234,0.05), transparent 70%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link
            to="/"
            className={`inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-1`}
          >
            <span
              className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="w-2 h-2 rounded-full bg-white" />
            </span>
            <span
              className={`font-display font-extrabold text-xl tracking-tight ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              weeb
            </span>
          </Link>
        </div>

        {/* Card */}
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`w-full rounded-2xl border p-7 space-y-5 ${
            isDark
              ? "bg-surface/60 border-border"
              : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="text-center mb-1"
          >
            <h1
              className={`font-display font-extrabold text-2xl mb-1 ${
                isDark ? "text-white" : "text-dark"
              }`}
            >
              {L.login || "Log In"}
            </h1>
            <p className={`text-sm ${isDark ? "text-white/50" : "text-dark/50"}`}>
              {language === "fr" ? "Connectez-vous à votre compte" : "Sign in to your account"}
            </p>
          </motion.div>

          {/* Lock countdown */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${
                isDark ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-600 border border-amber-200"
              }`}
            >
              <IconLock />
              {language === "fr"
                ? `Compte temporairement bloqué. Réessayez dans ${remainingLockSeconds}s.`
                : `Account temporarily locked. Retry in ${remainingLockSeconds}s.`}
            </motion.div>
          )}

          {/* Global error banner */}
          <AnimatePresence mode="wait">
            {errors.form && (
              <motion.div
                key={errors.form}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                role="alert"
                aria-live="polite"
                className={`flex items-start gap-2.5 text-sm p-3.5 rounded-xl border overflow-hidden ${
                  isDark
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {errors.form}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Identifier */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
          >
            <label htmlFor="identifier" className={labelCls}>
              {language === "fr" ? "Email ou nom d'utilisateur" : "Email or username"}
            </label>
            <input
              ref={identifierRef}
              id="identifier"
              type="text"
              autoComplete="username email"
              value={form.identifier}
              onChange={handleChange}
              disabled={isLocked}
              placeholder={language === "fr" ? "exemple@email.com" : "example@email.com"}
              className={`${inputBase} ${errors.identifier ? inputErr : ""} ${disabledCls}`}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? "identifier-error" : undefined}
            />
            {errors.identifier && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="identifier-error"
                role="alert"
                className="mt-1.5 text-xs text-red-500"
              >
                {errors.identifier}
              </motion.p>
            )}
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.26 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className={labelCls.replace("mb-1.5", "mb-0")}>
                {L.password || "Password"}
              </label>
              <Link
                to="/forgot-password"
                className={`text-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded ${
                  isDark ? "text-white/40 hover:text-primary" : "text-dark/40 hover:text-secondary"
                }`}
              >
                {L.forgot_password || "Forgot?"}
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                disabled={isLocked}
                placeholder="••••••••"
                className={`${inputBase} ${errors.password ? inputErr : ""} ${disabledCls} pr-11`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={isLocked}
                aria-label={
                  showPassword
                    ? (language === "fr" ? "Masquer le mot de passe" : "Hide password")
                    : (language === "fr" ? "Afficher le mot de passe" : "Show password")
                }
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isDark ? "text-white/35 hover:text-white/70" : "text-dark/35 hover:text-dark/70"
                } ${isLocked ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {showPassword ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="password-error"
                role="alert"
                className="mt-1.5 text-xs text-red-500"
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
          >
            <button
              type="submit"
              disabled={submitting || isLocked}
              className={`w-full py-3 rounded-xl font-semibold text-sm text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isDark
                  ? "bg-secondary hover:bg-secondary/85 focus-visible:ring-offset-background"
                  : "bg-secondary hover:bg-secondary/90 focus-visible:ring-offset-white"
              } ${submitting || isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <IconSpin />
                  {language === "fr" ? "Connexion…" : "Signing in…"}
                </span>
              ) : (
                L.login || "Log In"
              )}
            </button>
          </motion.div>

          {/* OAuth divider + providers */}
          {hasAnyOAuth && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.40 }}
              className="space-y-3"
            >
              <div className="relative flex items-center gap-3">
                <div className={`flex-1 h-px ${isDark ? "bg-border" : "bg-gray-200"}`} />
                <span className={`text-[11px] shrink-0 ${isDark ? "text-white/35" : "text-dark/35"}`}>
                  {L.or_continue_with || "Or continue with"}
                </span>
                <div className={`flex-1 h-px ${isDark ? "bg-border" : "bg-gray-200"}`} />
              </div>

              <div className="space-y-2">
                {hasGoogleOAuth && (
                  <GoogleOAuthProvider clientId={appEnv.VITE_GOOGLE_CLIENT_ID.trim()}>
                    <div
                      className={`overflow-hidden rounded-xl border transition-colors ${
                        isDark
                          ? "border-border bg-surface hover:border-border-2"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      } focus-within:ring-2 focus-within:ring-primary/30`}
                    >
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="continue_with"
                        shape="rectangular"
                        size="large"
                        width="100%"
                        theme={isDark ? "filled_black" : "outline"}
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
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[44px] ${
                      isDark
                        ? "border-border bg-surface text-white hover:bg-surface-2"
                        : "border-gray-200 bg-white text-dark hover:bg-gray-50"
                    }`}
                  >
                    {provider.id === "github"
                      ? L.oauth_github || "Continue with GitHub"
                      : `${L.login || "Log In"} ${provider.label}`}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.46 }}
            className="text-center pt-1"
          >
            <p className={`text-xs ${isDark ? "text-white/45" : "text-dark/45"}`}>
              {L.no_account || "No account?"}{" "}
              <Link
                to="/register"
                className={`font-semibold underline underline-offset-4 transition-colors ${
                  isDark ? "text-white hover:text-primary" : "text-dark hover:text-secondary"
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
