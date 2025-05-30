import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import loginEn from "../../locales/en/login.json";
import loginFr from "../../locales/fr/login.json";
import Button from "../components/Button";

export default function Login() {
  const { theme } = useTheme();
  const { language } = useLanguage();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  const validate = () => {
    const errs = {};
    if (
      !form.email.trim() ||
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)
    )
      errs.email = language === "fr" ? loginFr.email_error : loginEn.email;
    if (!form.password.trim()) errs.password = language === "fr" ? loginFr.password_error : password_error;
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    // TODO: appel API connexion
    console.log("Connected via :", form);
  };

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-12 ${
        theme === "dark" ? "text-white" : "text-background"
      }`}
    >
      <motion.form
        onSubmit={handleSubmit}
        animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-8 space-y-6"
      >
        <h1 className="text-3xl font-bold text-center">
          {language === "fr" ? loginFr.login : loginEn.login}
        </h1>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
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
          />
          <label
            htmlFor={language === "fr" ? loginFr.email : loginEn.email}
            className={`absolute left-0 -top-2 text-sm transition-all
              peer-placeholder-shown:-top-2 peer-focus:-top-5
              ${
                theme === "dark"
                  ? "text-primary peer-focus:text-primary"
                  : "text-secondary peer-focus:text-secondary"
              }`}
          >
            {language === "fr" ? loginFr.email : loginEn.email}
          </label>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type="password"
            id="password"
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
          />
          <label
            htmlFor={language === "fr" ? loginFr.password : loginEn.password}
            className={`absolute left-0 -top-2 text-sm transition-all
              peer-placeholder-shown:-top-2 peer-focus:-top-5
              ${
                theme === "dark"
                  ? "text-primary peer-focus:text-primary"
                  : "text-secondary peer-focus:text-secondary"
              }`}
          >
            {language === "fr" ? loginFr.password : loginEn.password}
          </label>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Bouton animé */}
        <Button
          type="submit"
          className={`w-full px-4 py-2 rounded-md shadow text-sm ${
            theme === "dark"
              ? "bg-secondary text-white hover:bg-secondary/90"
              : "bg-primary text-dark hover:bg-primary/90"
          }`}
        >
          {language === "fr" ? loginFr.login : loginEn.login}
        </Button>

        {/* Liens */}
        <div className="text-center text-xs space-y-2">
          <Link
            to="/forgot-password"
            className={`block ${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          >
            {language === "fr"
              ? loginFr.forgot_password
              : loginEn.forgot_password}
          </Link>
          <p
            className={`${
              theme === "dark" ? "text-muted" : "text-background/80"
            }`}
          >
            {language === "fr" ? loginFr.no_account : loginEn.no_account}{" "}
            <Link
              to="/register"
              className={`font-medium underline underline-offset-8 ${
                theme === "dark"
                  ? "text-white hover:text-primary"
                  : "text-background hover:text-secondary"
              }`}
            >
              {language === "fr"
                ? loginFr.create_account
                : loginEn.create_account}
            </Link>
          </p>
        </div>
      </motion.form>
    </section>
  );
}
