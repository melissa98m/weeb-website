import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { AuthApi } from "../lib/api";
import Button from "../components/Button";
import forgotEn from "../../locales/en/forgot_password.json";
import forgotFr from "../../locales/fr/forgot_password.json";

export default function ForgotPassword() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? forgotFr : forgotEn;

  const [form, setForm] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);

  const validate = () => {
    const errs = {};
    const email = form.email.trim();
    if (!email) {
      errs.email = t.email_required || "Email is required.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errs.email = t.email_invalid || "Invalid email.";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: null, form: null }));
    setServerMsg(null);
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
      await AuthApi.requestPasswordReset({ email: form.email.trim() });
      setServerMsg({
        type: "success",
        text:
          t.success_message ||
          "If an account exists for this email, you will receive a reset link shortly.",
      });
    } catch (err) {
      const details = err?.details || {};
      if (details.email) {
        setErrors({
          email: Array.isArray(details.email) ? details.email.join(" ") : String(details.email),
        });
      } else {
        setServerMsg({
          type: "error",
          text: t.error_message || "Unable to send reset email. Please try again later.",
        });
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBorder =
    theme === "dark" ? "border-primary focus:border-primary" : "border-secondary focus:border-secondary";

  return (
    <section className={`min-h-screen flex items-center justify-center px-6 py-12 ${theme === "dark" ? "text-white" : "text-background"}`}>
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-sm p-8 space-y-6 ${theme === "dark" ? "bg-[#C084FC1A] border border-primary" : "bg-light border border-secondary"}`}
      >
        <h1 className="text-3xl font-bold text-center">{t.title || "Forgot password"}</h1>
        <p className={`text-sm text-center ${theme === "dark" ? "text-muted" : "text-background/70"}`}>
          {t.description || "Enter your email to receive a password reset link."}
        </p>

        {serverMsg && (
          <div
            className={`text-sm rounded-md p-3 ${
              serverMsg.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {serverMsg.text}
          </div>
        )}

        <div className="relative">
          <input
            type="email"
            id="email"
            autoComplete="email"
            placeholder=" "
            value={form.email}
            onChange={handleChange}
            className={`peer w-full bg-transparent border-b-2 py-2 focus:outline-none ${
              errors.email ? "border-red-500 focus:border-red-500" : inputBorder
            }`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          <label
            htmlFor="email"
            className={`absolute left-0 -top-2 text-sm transition-all peer-placeholder-shown:-top-2 peer-focus:-top-5 ${
              theme === "dark" ? "text-primary peer-focus:text-primary" : "text-secondary peer-focus:text-secondary"
            }`}
          >
            {t.email_label || "Email"}
          </label>
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className={`w-full px-4 py-2 rounded-md shadow text-sm ${
            theme === "dark" ? "bg-secondary text-white hover:bg-secondary/90" : "bg-primary text-dark hover:bg-primary/90"
          } ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {submitting ? (t.submitting || "Sending...") : (t.submit || "Send reset link")}
        </Button>

        <div className="text-center text-xs">
          <Link
            to="/login"
            className={`font-medium underline underline-offset-8 ${theme === "dark" ? "text-white hover:text-primary" : "text-background hover:text-secondary"}`}
          >
            {t.back_to_login || "Back to login"}
          </Link>
        </div>
      </motion.form>
    </section>
  );
}
