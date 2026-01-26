import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import registerEn from "../../locales/en/register.json";
import registerFr from "../../locales/fr/register.json";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

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
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimeoutRef = useRef(null);

  const [pwdValidations, setPwdValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  // Focus sur le premier champ au montage
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, []);

  // Nettoyage du timeout de verrouillage
  useEffect(() => {
    return () => {
      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const { password } = form;
    setPwdValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [form.password]);

  // Helpers téléphone
  const onlyDialable = (s) => (s || "").replace(/[^\d]/g, "");
  const phoneLooksOk = (raw) => {
    if (!raw) return true;
    if (!/^[+()\-\s0-9]+$/.test(raw)) return false;
    const digits = onlyDialable(raw);
    return digits.length >= 8 && digits.length <= 15;
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = t.username_error;
    if (!form.nom.trim()) errs.nom = t.name_error;
    if (!form.prenom.trim()) errs.prenom = t.firstname_error;

    const emailOk = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim());
    if (!emailOk) errs.email = t.email_error;

    if (form.telephone && !phoneLooksOk(form.telephone)) {
      errs.telephone =
        t.phone_error_invalid ||
        (language === "fr"
          ? "Numéro invalide. Utilisez 8–15 chiffres (peuvent contenir + ( ) - espaces)."
          : "Invalid phone. Use 8–15 digits (may include + ( ) - spaces).");
    }

    if (Object.values(pwdValidations).some((ok) => !ok)) {
      errs.password = t.password_error;
    }
    if (!form.confirmPassword.trim()) {
      errs.confirmPassword = t.confirm_password_required;
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = t.passwords_not_match;
    }
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "telephone") {
      if (value === "" || /^[+()\-\s0-9]+$/.test(value)) {
        setForm((prev) => ({ ...prev, telephone: value }));
        setErrors((prev) => ({ ...prev, telephone: null }));
      }
      return;
    }

    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: null, form: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier si le compte est verrouillé
    if (isLocked) {
      setErrors({ 
        form: language === "fr" 
          ? "Trop de tentatives. Veuillez patienter quelques instants." 
          : "Too many attempts. Please wait a moment." 
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
      // Envoie les 2 clés phone/telephone pour compat backend
      await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.prenom.trim(),
        last_name: form.nom.trim(),
        phone: form.telephone || undefined,
        telephone: form.telephone || undefined,
        password: form.password,
        password_confirm: form.confirmPassword,
      });
      // Réinitialiser le compteur en cas de succès
      setAttemptCount(0);
      navigate(redirectTo, { replace: true });
    } catch (e2) {
      const d = e2?.details || {};
      const map = {};
      if (d.username) map.username = Array.isArray(d.username) ? d.username.join(" ") : String(d.username);
      if (d.email) map.email = Array.isArray(d.email) ? d.email.join(" ") : String(d.email);
      if (d.first_name) map.prenom = Array.isArray(d.first_name) ? d.first_name.join(" ") : String(d.first_name);
      if (d.last_name) map.nom = Array.isArray(d.last_name) ? d.last_name.join(" ") : String(d.last_name);
      if (d.password) map.password = Array.isArray(d.password) ? d.password.join(" ") : String(d.password);
      if (d.password_confirm) map.confirmPassword = Array.isArray(d.password_confirm) ? d.password_confirm.join(" ") : String(d.password_confirm);
      if (d.phone || d.telephone) {
        const v = d.phone || d.telephone;
        map.telephone = Array.isArray(v) ? v.join(" ") : String(v);
      }
      
      // Gestion du rate limiting côté client
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      // Verrouiller après 5 tentatives échouées
      if (newAttemptCount >= 5) {
        setIsLocked(true);
        if (lockTimeoutRef.current) {
          clearTimeout(lockTimeoutRef.current);
        }
        lockTimeoutRef.current = setTimeout(() => {
          setIsLocked(false);
          setAttemptCount(0);
        }, 30000); // 30 secondes

        map.form = language === "fr" 
          ? "Trop de tentatives échouées. Veuillez patienter 30 secondes." 
          : "Too many failed attempts. Please wait 30 seconds.";
      } else {
        map.form =
          d.non_field_errors?.join(" ") ||
          d.detail ||
          (language === "fr" ? "Échec de l'inscription." : "Registration failed.");
      }
      
      setErrors(map);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full p-3 rounded-md border focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? "border-red-500 focus:ring-red-400 focus:border-red-500"
        : theme === "dark"
        ? "bg-[#1c1c1c] border-[#333] text-white focus:ring-primary focus:border-primary"
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
        className="w-full max-w-3xl"
      >
        <motion.form
          onSubmit={handleSubmit}
          noValidate
          animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
          className={`w-full p-8 rounded-lg border shadow-lg text-sm space-y-6 ${
            theme === "dark" ? "bg-[#C084FC1A] border-primary" : "bg-white border-secondary shadow-xl"
          }`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-center mb-2">{t.register}</h1>
            <p className={`text-center text-sm ${theme === "dark" ? "text-muted" : "text-gray-600"}`}>
              {language === "fr" 
                ? "Créez votre compte pour commencer" 
                : "Create your account to get started"}
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

        {/* Username */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="username" className="block font-medium mb-2">
            {t.username}
          </label>
          <input
            ref={usernameRef}
            id="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            disabled={isLocked}
            className={fieldClass(!!errors.username)}
            placeholder={t.username_placeholder}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "username-error" : undefined}
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block font-medium mb-2">
              {t.name}
            </label>
            <input
              id="nom"
              type="text"
              value={form.nom}
              onChange={handleChange}
              disabled={isLocked}
              className={fieldClass(!!errors.nom)}
              aria-invalid={!!errors.nom}
              aria-describedby={errors.nom ? "nom-error" : undefined}
            />
            {errors.nom && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="nom-error"
                className="text-red-500 text-xs mt-1"
                role="alert"
              >
                {errors.nom}
              </motion.p>
            )}
          </div>

          {/* Prénom */}
          <div>
            <label htmlFor="prenom" className="block font-medium mb-2">
              {t.firstname}
            </label>
            <input
              id="prenom"
              type="text"
              value={form.prenom}
              onChange={handleChange}
              disabled={isLocked}
              className={fieldClass(!!errors.prenom)}
              aria-invalid={!!errors.prenom}
              aria-describedby={errors.prenom ? "prenom-error" : undefined}
            />
            {errors.prenom && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="prenom-error"
                className="text-red-500 text-xs mt-1"
                role="alert"
              >
                {errors.prenom}
              </motion.p>
            )}
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <label htmlFor="email" className="block font-medium mb-2">
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={isLocked}
              className={fieldClass(!!errors.email)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="email-error"
                className="text-red-500 text-xs mt-1"
                role="alert"
              >
                {errors.email}
              </motion.p>
            )}
          </div>

          {/* Téléphone */}
          <div className="md:col-span-2">
            <label htmlFor="telephone" className="block font-medium mb-2">
              {t.phone}
            </label>
            <input
              id="telephone"
              type="tel"
              inputMode="tel"
              value={form.telephone}
              onChange={handleChange}
              disabled={isLocked}
              placeholder={t.phone_placeholder}
              className={fieldClass(!!errors.telephone)}
              aria-invalid={!!errors.telephone}
              aria-describedby={errors.telephone ? "telephone-error" : undefined}
            />
            {errors.telephone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                id="telephone-error"
                className="mt-1 text-xs text-red-500"
                role="alert"
              >
                {errors.telephone}
              </motion.p>
            )}
            <p className={`mt-1 text-xs ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
              {t.phone_hint ||
                (language === "fr"
                  ? "Exemples valides : +33 6 12 34 56 78 ou (06) 12-34-56-78"
                  : "Valid examples: +1 212 555 0123 or (212) 555-0123")}
            </p>
          </div>
        </motion.div>

        {/* Password */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label htmlFor="password" className="block font-medium mb-2">
            {t.password}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              disabled={isLocked}
              className={`${fieldClass(!!errors.password)} pr-12`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : "password-requirements"}
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              disabled={isLocked}
              className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-sm transition-colors ${
                theme === "dark"
                  ? "text-muted hover:text-primary"
                  : "text-gray-500 hover:text-secondary"
              } ${isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"} focus:outline-none focus:ring-2 focus:ring-primary rounded`}
              aria-label={showPwd 
                ? (language === "fr" ? "Masquer le mot de passe" : "Hide password")
                : (language === "fr" ? "Afficher le mot de passe" : "Show password")
              }
            >
              {showPwd ? (
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

          <ul id="password-requirements" className="mt-2 space-y-1 text-xs" role="list">
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`flex items-center transition-colors ${pwdValidations.length ? "text-green-500" : "text-red-500"}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${pwdValidations.length ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.min_caractere}</span>
            </motion.li>
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className={`flex items-center transition-colors ${pwdValidations.uppercase ? "text-green-500" : "text-red-500"}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${pwdValidations.uppercase ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.uppercase}</span>
            </motion.li>
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`flex items-center transition-colors ${pwdValidations.number ? "text-green-500" : "text-red-500"}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${pwdValidations.number ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.number}</span>
            </motion.li>
            <motion.li
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className={`flex items-center transition-colors ${pwdValidations.special ? "text-green-500" : "text-red-500"}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${pwdValidations.special ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.specialchar}</span>
            </motion.li>
          </ul>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              id="password-error"
              className="text-red-500 text-xs mt-1"
              role="alert"
            >
              {errors.password}
            </motion.p>
          )}
        </motion.div>

        {/* Confirm Password */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <label htmlFor="confirmPassword" className="block font-medium mb-2">
            {t.confirm_password}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPwd ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={isLocked}
              className={`${fieldClass(!!errors.confirmPassword)} pr-12`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              disabled={isLocked}
              className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-sm transition-colors ${
                theme === "dark"
                  ? "text-muted hover:text-primary"
                  : "text-gray-500 hover:text-secondary"
              } ${isLocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"} focus:outline-none focus:ring-2 focus:ring-primary rounded`}
              aria-label={showConfirmPwd 
                ? (language === "fr" ? "Masquer la confirmation du mot de passe" : "Hide password confirmation")
                : (language === "fr" ? "Afficher la confirmation du mot de passe" : "Show password confirmation")
              }
            >
              {showConfirmPwd ? (
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
          {errors.confirmPassword && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              id="confirmPassword-error"
              className="text-red-500 text-xs mt-1"
              role="alert"
            >
              {errors.confirmPassword}
            </motion.p>
          )}
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            type="submit"
            disabled={submitting || isLocked}
            className={`w-full px-6 py-3 rounded-md shadow-md text-sm font-medium transition-all ${
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
                {language === "fr"
                  ? "Création du compte…"
                  : "Creating account…"}
              </span>
            ) : (
              t.register
            )}
          </Button>
        </motion.div>

        {/* Already have account */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs pt-2"
        >
          <p className={`${theme === "dark" ? "text-muted" : "text-gray-600"}`}>
            {t.already_account}{" "}
            <Link
              to="/login"
              className={`font-medium underline underline-offset-4 transition-colors ${
                theme === "dark"
                  ? "text-white hover:text-primary"
                  : "text-background hover:text-secondary"
              }`}
            >
              {t.login}
            </Link>
          </p>
        </motion.div>
      </motion.form>
      </motion.div>
    </section>
  );
}
