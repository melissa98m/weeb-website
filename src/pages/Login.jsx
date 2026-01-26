import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import loginEn from "../../locales/en/login.json";
import loginFr from "../../locales/fr/login.json";

export default function Login() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const identifierRef = useRef(null);

  const L = language === "fr" ? loginFr : loginEn;

  // ⚠️ identifiant libre (email OU username)
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimeoutRef = useRef(null);

  // Focus sur le premier champ au montage
  useEffect(() => {
    if (identifierRef.current) {
      identifierRef.current.focus();
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
      const id = form.identifier.trim();
      console.debug("[LOGIN] submit with id=", id);

      const me = await login({
        email: id,
        username: id,
        identifier: id,
        password: form.password,
      });

      if (me) {
        // Réinitialiser le compteur en cas de succès
        setAttemptCount(0);
        navigate(from, { replace: true });
      } else {
        throw new Error("no_me");
      }
    } catch (e) {
      console.error("[LOGIN] error:", e);
      
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

        setErrors({ 
          form: language === "fr" 
            ? "Trop de tentatives échouées. Veuillez patienter 30 secondes." 
            : "Too many failed attempts. Please wait 30 seconds." 
        });
      } else {
        const apiMsg =
          e?.details?.non_field_errors?.join(" ") ||
          e?.details?.detail ||
          (language === "fr" ? "Identifiants invalides." : "Invalid credentials.");
        setErrors({ form: apiMsg });
      }
      
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
