import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { AuthApi } from "../lib/api";
import Button from "../components/Button";
import resetEn from "../../locales/en/reset_password.json";
import resetFr from "../../locales/fr/reset_password.json";

export default function ResetPassword() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? resetFr : resetEn;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { uid, token } = useMemo(() => {
    return {
      uid: (searchParams.get("uid") || "").trim(),
      token: (searchParams.get("token") || "").trim(),
    };
  }, [searchParams]);

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdValidations, setPwdValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    const { password } = form;
    setPwdValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [form.password]);

  const validate = () => {
    const errs = {};
    if (!uid || !token) {
      errs.form = t.missing_token || "Invalid or missing reset link.";
    }
    const pwd = form.password.trim();
    const pwdOk =
      pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);
    if (!pwdOk) {
      errs.password = t.password_error || t.password_min || "Password is too weak.";
    }
    if (!form.confirmPassword.trim()) {
      errs.confirmPassword = t.confirm_required || "Please confirm your password.";
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = t.passwords_mismatch || "Passwords do not match.";
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
      await AuthApi.confirmPasswordReset({
        uid,
        token,
        password: form.password,
        password_confirm: form.confirmPassword,
      });
      setServerMsg({ type: "success", text: t.success_message || "Password updated. You can now log in." });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const details = err?.details || {};
      const map = {};
      if (details.password) {
        map.password = Array.isArray(details.password) ? details.password.join(" ") : String(details.password);
      }
      if (details.password_confirm) {
        map.confirmPassword = Array.isArray(details.password_confirm)
          ? details.password_confirm.join(" ")
          : String(details.password_confirm);
      }
      if (details.uid || details.token) {
        map.form =
          details.uid?.join?.(" ") ||
          details.token?.join?.(" ") ||
          t.invalid_token ||
          "Reset link is invalid or expired.";
      }

      if (Object.keys(map).length) {
        setErrors(map);
      } else {
        setServerMsg({
          type: "error",
          text: t.error_message || "Unable to reset password. Please try again.",
        });
      }
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (hasError) =>
    `w-full p-3 rounded-md border focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-500 focus:ring-red-400"
        : theme === "dark"
        ? "bg-[#1c1c1c] border-[#333] text-white focus:ring-blue-500"
        : "bg-white border-gray-300 text-gray-900 focus:ring-blue-500"
    }`;

  return (
    <section className={`min-h-screen flex items-center justify-center px-6 py-12 ${theme === "dark" ? "text-white" : "text-background"}`}>
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-3xl p-6 rounded-md border text-sm space-y-6 ${
          theme === "dark" ? "bg-[#C084FC1A] border-primary" : "bg-light border-secondary"
        }`}
      >
        <h1 className="text-3xl font-bold text-center">{t.title || "Reset password"}</h1>
        <p className={`text-sm text-center ${theme === "dark" ? "text-muted" : "text-background/70"}`}>
          {t.description || "Choose a new password for your account."}
        </p>

        {errors.form && (
          <div className="text-sm rounded-md p-3 bg-red-100 text-red-700">
            {errors.form}
          </div>
        )}

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

        <div>
          <label htmlFor="password" className="block font-medium mb-2">
            {t.password_label || "New password"}
          </label>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={`${fieldClass(!!errors.password)} pr-20`}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <Button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md shadow text-sm border ${
                theme === "dark"
                  ? "bg-secondary text-white hover:bg-secondary/70 border-background"
                  : "bg-primary text-dark hover:bg-primary/70 border-muted"
              }`}
            >
              {showPwd ? t.hide || "Hide" : t.show || "Show"}
            </Button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-500">
              {errors.password}
            </p>
          )}
        </div>
        <ul className="mt-2 space-y-1 text-xs">
          <li
            className={`flex items-center transition-colors duration-200 ${
              pwdValidations.length ? "text-green-500" : "text-red-500"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200 ${
                pwdValidations.length ? "bg-green-500 scale-110" : "bg-red-500 scale-100"
              }`}
            />
            <span className="ml-2">{t.min_caractere || "At least 8 characters"}</span>
          </li>
          <li
            className={`flex items-center transition-colors duration-200 ${
              pwdValidations.uppercase ? "text-green-500" : "text-red-500"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200 ${
                pwdValidations.uppercase ? "bg-green-500 scale-110" : "bg-red-500 scale-100"
              }`}
            />
            <span className="ml-2">{t.uppercase || "At least one uppercase letter"}</span>
          </li>
          <li
            className={`flex items-center transition-colors duration-200 ${
              pwdValidations.number ? "text-green-500" : "text-red-500"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200 ${
                pwdValidations.number ? "bg-green-500 scale-110" : "bg-red-500 scale-100"
              }`}
            />
            <span className="ml-2">{t.number || "At least one number"}</span>
          </li>
          <li
            className={`flex items-center transition-colors duration-200 ${
              pwdValidations.special ? "text-green-500" : "text-red-500"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-200 ${
                pwdValidations.special ? "bg-green-500 scale-110" : "bg-red-500 scale-100"
              }`}
            />
            <span className="ml-2">{t.specialchar || "At least one special character"}</span>
          </li>
        </ul>

        <div>
          <label htmlFor="confirmPassword" className="block font-medium mb-2">
            {t.confirm_label || "Confirm password"}
          </label>
          <div className="relative">
            <input
              type={showConfirmPwd ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${fieldClass(!!errors.confirmPassword)} pr-20`}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
            <Button
              type="button"
              onClick={() => setShowConfirmPwd((v) => !v)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md shadow text-sm border ${
                theme === "dark"
                  ? "bg-secondary text-white hover:bg-secondary/70 border-background"
                  : "bg-primary text-dark hover:bg-primary/70 border-muted"
              }`}
            >
              {showConfirmPwd ? t.hide || "Hide" : t.show || "Show"}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="mt-1 text-xs text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={submitting || !uid || !token}
          className={`w-full px-4 py-2 rounded-md shadow text-sm ${
            theme === "dark" ? "bg-secondary text-white hover:bg-secondary/90" : "bg-primary text-dark hover:bg-primary/90"
          } ${submitting || !uid || !token ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {submitting ? (t.submitting || "Updating...") : (t.submit || "Update password")}
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
