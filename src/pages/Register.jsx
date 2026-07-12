import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import registerEn from "../../locales/en/register.json";
import registerFr from "../../locales/fr/register.json";
import { useAuth } from "../context/AuthContext";
import {
  getApiErrorMessage,
  getApiLockoutMessage,
  getApiRetryAfter,
  mapApiFieldErrors,
} from "../lib/api";

// ── Icons ──────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconMail = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const IconPhone = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const IconLock = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const IconEyeOff = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const IconEye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ── FloatingInput ──────────────────────────────────────────────────────────

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled,
  hasError,
  icon,
  rightAddon,
  inputRef,
  inputMode,
  ariaDescribedby,
  theme,
}) {
  const [focused, setFocused] = useState(false);
  const isFloated = focused || value !== "";

  const borderColor = hasError
    ? "border-red-400"
    : focused
    ? "border-primary"
    : theme === "dark"
    ? "border-border"
    : "border-gray-200";

  const labelColor = hasError
    ? "text-red-400"
    : isFloated && focused
    ? "text-primary"
    : "text-muted";

  return (
    <div className="relative">
      {icon && (
        <span
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
            focused ? "text-primary" : "text-muted"
          }`}
        >
          {icon}
        </span>
      )}

      <input
        ref={inputRef}
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder=""
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={hasError || undefined}
        aria-describedby={ariaDescribedby}
        className={[
          "w-full rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
          icon ? "pl-10" : "pl-4",
          rightAddon ? "pr-12" : "pr-4",
          "pt-5 pb-2 text-sm",
          theme === "dark" ? "bg-surface text-white" : "bg-gray-50 text-gray-900",
          borderColor,
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      />

      <label
        htmlFor={id}
        className={[
          "absolute pointer-events-none transition-all duration-200",
          icon ? "left-10" : "left-4",
          isFloated
            ? "top-[7px] text-[10px] font-semibold tracking-wider uppercase"
            : "top-1/2 -translate-y-1/2 text-sm",
          labelColor,
        ].join(" ")}
      >
        {label}
      </label>

      {rightAddon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightAddon}
        </div>
      )}
    </div>
  );
}

// ── PasswordStrengthBar ────────────────────────────────────────────────────

function PasswordStrengthBar({ pwdValidations, t, theme, id }) {
  const count = Object.values(pwdValidations).filter(Boolean).length;

  const strengthColor =
    count === 0 ? "" :
    count === 1 ? "bg-red-500" :
    count === 2 ? "bg-orange-400" :
    count === 3 ? "bg-yellow-400" :
    "bg-green-500";

  const emptyColor = theme === "dark" ? "bg-border" : "bg-gray-200";

  const criteria = [
    { key: "length",    label: t.min_caractere },
    { key: "uppercase", label: t.uppercase },
    { key: "number",    label: t.number },
    { key: "special",   label: t.specialchar },
  ];

  return (
    <div id={id} className="mt-2 space-y-2" role="list" aria-label="Password requirements">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              count > i ? strengthColor : emptyColor
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {criteria.map(({ key, label }) => (
          <span
            key={key}
            role="listitem"
            className={`text-[10px] flex items-center gap-1 transition-colors duration-200 ${
              pwdValidations[key]
                ? "text-green-500"
                : theme === "dark" ? "text-muted" : "text-gray-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                pwdValidations[key]
                  ? "bg-green-500"
                  : theme === "dark" ? "bg-border" : "bg-gray-300"
              }`}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── CustomCheckbox ─────────────────────────────────────────────────────────

function CustomCheckbox({ id, checked, onChange, disabled, hasError, label, errorId, theme }) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} group`}
    >
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
        />
        <div
          className={[
            "w-5 h-5 min-w-[20px] rounded-md border-2 transition-all duration-200 flex items-center justify-center",
            checked
              ? "bg-primary border-primary"
              : hasError
              ? "border-red-400"
              : theme === "dark"
              ? "border-border group-hover:border-primary/60"
              : "border-gray-300 group-hover:border-primary/60",
          ].join(" ")}
        >
          <AnimatePresence>
            {checked && (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-white"
              >
                <IconCheck />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <span className={`text-sm leading-relaxed ${theme === "dark" ? "text-muted" : "text-gray-600"}`}>
        {label}
      </span>
    </label>
  );
}

// ── EyeButton ─────────────────────────────────────────────────────────────

function EyeButton({ show, onToggle, disabled, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-0.5 ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      {show ? <IconEyeOff /> : <IconEye />}
    </button>
  );
}

// ── Register ───────────────────────────────────────────────────────────────

export default function Register() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? registerFr : registerEn;
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";
  const usernameRef = useRef(null);

  const [form, setForm] = useState({
    username: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    rgpdConsent: false,
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lockUntilTs, setLockUntilTs] = useState(0);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);

  const [pwdValidations, setPwdValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const prev = document.title;
    document.title = language === "fr" ? "Créer un compte | Weeb" : "Sign Up | Weeb";
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = prev;
      if (metaRobots) metaRobots.setAttribute("content", "index, follow");
    };
  }, [language]);

  useEffect(() => {
    if (usernameRef.current) usernameRef.current.focus();
  }, []);

  useEffect(() => {
    if (!lockUntilTs) {
      setRemainingLockSeconds(0);
      return;
    }
    const updateRemaining = () => {
      const remain = Math.max(0, Math.ceil((lockUntilTs - Date.now()) / 1000));
      setRemainingLockSeconds(remain);
      if (remain <= 0) setLockUntilTs(0);
    };
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [lockUntilTs]);

  const isLocked = remainingLockSeconds > 0;

  useEffect(() => {
    const { password } = form;
    setPwdValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [form.password]);

  const onlyDialable = (s) => (s || "").replace(/[^\d]/g, "");
  const normalizePhone = (raw) => {
    const source = (raw || "").trim();
    if (!source) return "";
    const hasLeadingPlus = source.startsWith("+");
    const digits = onlyDialable(source);
    return hasLeadingPlus ? `+${digits}` : digits;
  };
  const phoneLooksOk = (raw) => /^\+?\d{6,20}$/.test(normalizePhone(raw));

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = t.username_error;
    if (!form.nom.trim()) errs.nom = t.name_error;
    if (!form.prenom.trim()) errs.prenom = t.firstname_error;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())) errs.email = t.email_error;
    if (!form.telephone.trim()) {
      errs.telephone = t.phone_required || (language === "fr" ? "Le téléphone est requis." : "Phone is required.");
    } else if (!phoneLooksOk(form.telephone)) {
      errs.telephone = t.phone_error_invalid || (language === "fr"
        ? "Numéro invalide. Utilisez 6 à 20 chiffres (préfixe + autorisé)."
        : "Invalid phone. Use 6 to 20 digits (optional leading +).");
    }
    if (Object.values(pwdValidations).some((ok) => !ok)) errs.password = t.password_error;
    if (!form.confirmPassword.trim()) {
      errs.confirmPassword = t.confirm_password_required;
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = t.passwords_not_match;
    }
    if (!form.rgpdConsent) {
      errs.rgpdConsent = t.rgpd_consent_error || (language === "fr"
        ? "Vous devez accepter le traitement des données personnelles."
        : "You must accept the personal data processing terms.");
    }
    return errs;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === "telephone") {
      if (value === "" || /^[+()\-\s0-9]+$/.test(value)) {
        setForm((prev) => ({ ...prev, telephone: value }));
        setErrors((prev) => ({ ...prev, telephone: null }));
      }
      return;
    }
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [id]: checked }));
      setErrors((prev) => ({ ...prev, [id]: null, form: null }));
      return;
    }
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: null, form: null }));
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
    if (Object.keys(validation).length) {
      setErrors(validation);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    try {
      setSubmitting(true);
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.prenom.trim(),
        last_name: form.nom.trim(),
        phone: normalizePhone(form.telephone),
        password: form.password,
      });
      setLockUntilTs(0);
      navigate(redirectTo, { replace: true });
    } catch (e2) {
      const map = mapApiFieldErrors(e2, {
        username: "username",
        email: "email",
        prenom: "first_name",
        nom: "last_name",
        password: "password",
        confirmPassword: "password_confirm",
        telephone: ["phone", "telephone"],
      });
      if (e2?.status === 429) {
        const retryAfter = getApiRetryAfter(e2) ?? 30;
        setLockUntilTs(Date.now() + retryAfter * 1000);
        map.form = getApiLockoutMessage(e2, language, retryAfter);
      } else {
        map.form = getApiErrorMessage(
          e2,
          language === "fr" ? "Échec de l'inscription." : "Registration failed."
        );
      }
      setErrors(map);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const isFr = language === "fr";

  return (
    <section className={theme === "dark" ? "bg-background" : "bg-white"}>
      <div className="min-h-screen lg:grid lg:grid-cols-2">

        {/* ── LEFT PANEL — branding ──────────────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col relative overflow-hidden bg-gradient-to-br from-primary to-secondary lg:sticky lg:top-0 lg:h-screen"
          aria-hidden="true"
        >
          {/* Orbs */}
          <motion.div
            className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
            animate={{ y: [0, -28, 0], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/3 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"
            animate={{ y: [0, 22, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
          />
          <motion.div
            className="absolute bottom-10 right-1/4 w-64 h-64 rounded-full bg-white/15 blur-2xl"
            animate={{ y: [0, -18, 0], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          />

          {/* Logo */}
          <div className="relative z-10 p-8">
            <Link to="/" tabIndex={-1} className="inline-flex items-center gap-2">
              <span className="text-white font-bold text-2xl font-display tracking-tight">Weeb</span>
            </Link>
          </div>

          {/* Central content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 text-white text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-7xl mb-6 select-none"
            >
              ✦
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-3xl font-bold font-display leading-snug mb-4"
            >
              {isFr ? "Rejoins la communauté." : "Join the community."}
              <br />
              {isFr ? "Explore. Apprends." : "Explore. Learn."}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-white/70 text-sm max-w-xs leading-relaxed"
            >
              {isFr
                ? "Accès illimité à nos formations et contenus exclusifs."
                : "Unlimited access to our courses and exclusive content."}
            </motion.p>
          </div>

          {/* Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="relative z-10 p-8"
          >
            <ul className="space-y-3">
              {[
                isFr ? "Accès aux formations" : "Access to courses",
                isFr ? "Tableau de bord personnel" : "Personal dashboard",
                isFr ? "Contenu exclusif" : "Exclusive content",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white">
                    <IconCheck />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── RIGHT PANEL — form ─────────────────────────────────────────── */}
        <div
          className={`flex items-start lg:items-center justify-center px-6 md:px-12 py-10 min-h-screen ${
            theme === "dark" ? "bg-background" : "bg-white"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-2xl font-bold font-display mb-1.5 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {isFr ? "Créer un compte" : "Create an account"}
              </h1>
              <p className={`text-sm ${theme === "dark" ? "text-muted" : "text-gray-500"}`}>
                {t.already_account}{" "}
                <Link
                  to="/login"
                  className={`font-medium underline underline-offset-4 transition-colors ${
                    theme === "dark" ? "text-primary hover:text-primary/80" : "text-secondary hover:text-secondary/80"
                  }`}
                >
                  {t.login}
                </Link>
              </p>
            </div>

            {/* Global error */}
            <AnimatePresence mode="wait">
              {errors.form && (
                <motion.div
                  key="form-error"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="text-sm rounded-xl p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-300 dark:border-red-700"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.form}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              noValidate
              animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              {/* Username */}
              <div>
                <FloatingInput
                  id="username"
                  label={t.username}
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  disabled={isLocked}
                  hasError={!!errors.username}
                  icon={<IconUser />}
                  inputRef={usernameRef}
                  ariaDescribedby={errors.username ? "username-error" : undefined}
                  theme={theme}
                />
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    id="username-error"
                    className="mt-1 text-xs text-red-500"
                    role="alert"
                  >
                    {errors.username}
                  </motion.p>
                )}
              </div>

              {/* Nom + Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FloatingInput
                    id="nom"
                    label={t.name}
                    type="text"
                    value={form.nom}
                    onChange={handleChange}
                    disabled={isLocked}
                    hasError={!!errors.nom}
                    ariaDescribedby={errors.nom ? "nom-error" : undefined}
                    theme={theme}
                  />
                  {errors.nom && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      id="nom-error"
                      className="mt-1 text-xs text-red-500"
                      role="alert"
                    >
                      {errors.nom}
                    </motion.p>
                  )}
                </div>
                <div>
                  <FloatingInput
                    id="prenom"
                    label={t.firstname}
                    type="text"
                    value={form.prenom}
                    onChange={handleChange}
                    disabled={isLocked}
                    hasError={!!errors.prenom}
                    ariaDescribedby={errors.prenom ? "prenom-error" : undefined}
                    theme={theme}
                  />
                  {errors.prenom && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      id="prenom-error"
                      className="mt-1 text-xs text-red-500"
                      role="alert"
                    >
                      {errors.prenom}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <FloatingInput
                  id="email"
                  label={t.email}
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLocked}
                  hasError={!!errors.email}
                  icon={<IconMail />}
                  ariaDescribedby={errors.email ? "email-error" : undefined}
                  theme={theme}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    id="email-error"
                    className="mt-1 text-xs text-red-500"
                    role="alert"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <FloatingInput
                  id="telephone"
                  label={t.phone}
                  type="tel"
                  inputMode="tel"
                  value={form.telephone}
                  onChange={handleChange}
                  disabled={isLocked}
                  hasError={!!errors.telephone}
                  icon={<IconPhone />}
                  ariaDescribedby={errors.telephone ? "telephone-error" : undefined}
                  theme={theme}
                />
                {errors.telephone ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    id="telephone-error"
                    className="mt-1 text-xs text-red-500"
                    role="alert"
                  >
                    {errors.telephone}
                  </motion.p>
                ) : (
                  <p className={`mt-1 text-[10px] ${theme === "dark" ? "text-muted/70" : "text-gray-400"}`}>
                    {t.phone_hint}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <FloatingInput
                  id="password"
                  label={t.password}
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLocked}
                  hasError={!!errors.password}
                  icon={<IconLock />}
                  rightAddon={
                    <EyeButton
                      show={showPwd}
                      onToggle={() => setShowPwd((v) => !v)}
                      disabled={isLocked}
                      ariaLabel={showPwd
                        ? (isFr ? "Masquer le mot de passe" : "Hide password")
                        : (isFr ? "Afficher le mot de passe" : "Show password")}
                    />
                  }
                  ariaDescribedby={errors.password ? "password-error" : "password-requirements"}
                  theme={theme}
                />
                <PasswordStrengthBar
                  id="password-requirements"
                  pwdValidations={pwdValidations}
                  t={t}
                  theme={theme}
                />
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
              </div>

              {/* Confirm password */}
              <div>
                <FloatingInput
                  id="confirmPassword"
                  label={t.confirm_password}
                  type={showConfirmPwd ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={isLocked}
                  hasError={!!errors.confirmPassword}
                  icon={<IconLock />}
                  rightAddon={
                    <EyeButton
                      show={showConfirmPwd}
                      onToggle={() => setShowConfirmPwd((v) => !v)}
                      disabled={isLocked}
                      ariaLabel={showConfirmPwd
                        ? (isFr ? "Masquer la confirmation" : "Hide confirm password")
                        : (isFr ? "Afficher la confirmation" : "Show confirm password")}
                    />
                  }
                  ariaDescribedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  theme={theme}
                />
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    id="confirmPassword-error"
                    className="mt-1 text-xs text-red-500"
                    role="alert"
                  >
                    {errors.confirmPassword}
                  </motion.p>
                )}
              </div>

              {/* RGPD */}
              <div>
                <CustomCheckbox
                  id="rgpdConsent"
                  checked={form.rgpdConsent}
                  onChange={handleChange}
                  disabled={isLocked}
                  hasError={!!errors.rgpdConsent}
                  label={t.rgpd_consent}
                  errorId="rgpd-consent-error"
                  theme={theme}
                />
                {errors.rgpdConsent && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    id="rgpd-consent-error"
                    className="mt-1 text-xs text-red-500"
                    role="alert"
                  >
                    {errors.rgpdConsent}
                  </motion.p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || isLocked}
                className={[
                  "w-full min-h-[48px] rounded-xl font-semibold text-sm text-white",
                  "bg-gradient-to-r from-primary to-secondary",
                  "transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  theme === "dark" ? "focus:ring-offset-background" : "focus:ring-offset-white",
                  submitting || isLocked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.015] active:scale-[0.985]",
                ].join(" ")}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {isFr ? "Création en cours…" : "Creating account…"}
                  </span>
                ) : (
                  t.register
                )}
              </button>
            </motion.form>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
