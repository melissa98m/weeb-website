import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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

  const L = language === "fr" ? loginFr : loginEn;

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    const emailOk = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim());
    if (!emailOk) errs.email = L.email_error || "Invalid email address.";
    if (!form.password.trim()) errs.password = L.password_error || "Password is required.";
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: null, form: null }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const validation = validate();
  if (Object.keys(validation).length) {
    setErrors(validation);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    return;
  }

  try {
    setSubmitting(true);
    const id = form.email.trim();

    // Envoie email/username/identifier + password
    const me = await login({
      email: id,
      username: id,
      identifier: id,
      password: form.password,
    });

    if (me) {
      // redirige (depuis ProtectedRoute ça passera car user est hydraté)
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } else {
      throw new Error("no_me");
    }
  } catch (e) {
    const apiMsg =
      e?.details?.non_field_errors?.join(" ") ||
      e?.details?.detail ||
      (language === "fr" ? "Identifiants invalides." : "Invalid credentials.");
    setErrors({ form: apiMsg });
    setShake(true);
    setTimeout(() => setShake(false), 500);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-12 ${
        theme === "dark" ? "text-white" : "text-background"
      }`}
    >
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-8 space-y-6"
      >
        <h1 className="text-3xl font-bold text-center">{L.login || "Login"}</h1>

        {errors.form && (
          <div className="text-sm rounded-md p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {errors.form}
          </div>
        )}

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
            autoComplete="email"
            placeholder=" "
            value={form.email}
            onChange={handleChange}
            className={`peer w-full bg-transparent border-b-2 py-2 focus:outline-none
              ${
                errors.email
                  ? "border-red-500 focus:border-red-500"
                  : theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              }`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <label
            htmlFor="email"
            className={`absolute left-0 -top-2 text-sm transition-all
              peer-placeholder-shown:-top-2 peer-focus:-top-5
              ${
                theme === "dark"
                  ? "text-primary peer-focus:text-primary"
                  : "text-secondary peer-focus:text-secondary"
              }`}
          >
            {L.email || "Email"}
          </label>
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            placeholder=" "
            value={form.password}
            onChange={handleChange}
            className={`peer w-full bg-transparent border-b-2 py-2 focus:outline-none
              ${
                errors.password
                  ? "border-red-500 focus:border-red-500"
                  : theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              }`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <label
            htmlFor="password"
            className={`absolute left-0 -top-2 text-sm transition-all
              peer-placeholder-shown:-top-2 peer-focus:-top-5
              ${
                theme === "dark"
                  ? "text-primary peer-focus:text-primary"
                  : "text-secondary peer-focus:text-secondary"
              }`}
          >
            {L.password || "Password"}
          </label>
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={submitting}
          className={`w-full px-4 py-2 rounded-md shadow text-sm ${
            theme === "dark"
              ? "bg-secondary text-white hover:bg-secondary/90"
              : "bg-primary text-dark hover:bg-primary/90"
          } ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {submitting
            ? language === "fr"
              ? "Connexion..."
              : "Signing in..."
            : L.login || "Login"}
        </Button>

        {/* Links */}
        <div className="text-center text-xs space-y-2">
          <Link
            to="/forgot-password"
            className={`${theme === "dark" ? "hover:text-primary" : "hover:text-secondary"}`}
          >
            {L.forgot_password || "Forgot your password?"}
          </Link>
          <p className={`${theme === "dark" ? "text-muted" : "text-background/80"}`}>
            {L.no_account || "No account yet?"}{" "}
            <Link
              to="/register"
              className={`font-medium underline underline-offset-8 ${
                theme === "dark"
                  ? "text-white hover:text-primary"
                  : "text-background hover:text-secondary"
              }`}
            >
              {L.create_account || "Create one"}
            </Link>
          </p>
        </div>
      </motion.form>
    </section>
  );
}