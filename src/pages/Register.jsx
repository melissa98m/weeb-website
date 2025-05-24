import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import registerEn from "../../locales/en/register.json";
import registerFr from "../../locales/fr/register.json";
import Button from "../components/Button";

export default function Register() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? registerFr : registerEn;

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
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
    if (!form.nom.trim()) errs.nom = t.name_error;
    if (!form.prenom.trim()) errs.prenom = t.firstname_error;
    if (!/^[0-9+ ]{6,15}$/.test(form.telephone)) errs.telephone = t.phone_error;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email))
      errs.email = t.email_error;
    if (Object.values(pwdValidations).some((ok) => !ok))
      errs.password = t.password_error;
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
    console.log("Registered:", form);
  };

  return (
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-12 ${
        theme === "dark" ? "text-white" : "text-background"
      }`}
    >
      <motion.form
        onSubmit={handleSubmit}
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-3xl p-6 rounded-md border text-sm space-y-6
          ${
            theme === "dark"
              ? "bg-[#C084FC1A] border-primary"
              : "bg-light border-secondary"
          }`}
      >
        <h1 className="text-3xl font-bold text-center">{t.register}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label
              htmlFor="nom"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              {t.name}
            </label>
            <input
              id="nom"
              type="text"
              value={form.nom}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none
                ${
                  errors.nom
                    ? "border-red-500"
                    : theme === "dark"
                    ? "border-primary focus:border-primary"
                    : "border-secondary focus:border-secondary"
                }`}
            />
            {errors.nom && (
              <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
            )}
          </div>

          {/* Prénom */}
          <div>
            <label
              htmlFor="prenom"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              {t.firstname}
            </label>
            <input
              id="prenom"
              type="text"
              value={form.prenom}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none
                ${
                  errors.prenom
                    ? "border-red-500"
                    : theme === "dark"
                    ? "border-primary focus:border-primary"
                    : "border-secondary focus:border-secondary"
                }`}
            />
            {errors.prenom && (
              <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label
              htmlFor="telephone"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              {t.phone}
            </label>
            <input
              id="telephone"
              type="tel"
              value={form.telephone}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none
                ${
                  errors.telephone
                    ? "border-red-500"
                    : theme === "dark"
                    ? "border-primary focus:border-primary"
                    : "border-secondary focus:border-secondary"
                }`}
            />
            {errors.telephone && (
              <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none
                ${
                  errors.email
                    ? "border-red-500"
                    : theme === "dark"
                    ? "border-primary focus:border-primary"
                    : "border-secondary focus:border-secondary"
                }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className={`block mb-1 ${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            {t.password}
          </label>
          <div className="relative flex items-center">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 pr-10 focus:outline-none
                ${
                  errors.password
                    ? "border-red-500"
                    : theme === "dark"
                    ? "border-primary focus:border-primary"
                    : "border-secondary focus:border-secondary"
                }`}
            />
            <Button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className={`absolute right-0 mr-2 mb-2 px-2 py-1 rounded-md shadow text-sm border hover:border-none ${
                theme === "dark"
                  ? "bg-secondary text-white hover:bg-secondary/70 border-background"
                  : "bg-primary text-dark hover:bg-primary/70 border-muted"
              }`}
            >
              {showPwd ? t.hide : t.show}
            </Button>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            <li
              className={`flex items-center ${
                pwdValidations.length ? "text-green-500" : "text-red-500"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  pwdValidations.length ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="ml-1">{t.min_caractere}</span>
            </li>
            <li
              className={`flex items-center ${
                pwdValidations.uppercase ? "text-green-500" : "text-red-500"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  pwdValidations.uppercase ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="ml-1">{t.uppercase}</span>
            </li>
            <li
              className={`flex items-center ${
                pwdValidations.number ? "text-green-500" : "text-red-500"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  pwdValidations.number ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="ml-1">{t.number}</span>
            </li>
            <li
              className={`flex items-center ${
                pwdValidations.special ? "text-green-500" : "text-red-500"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  pwdValidations.special ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="ml-1">{t.specialchar}</span>
            </li>
          </ul>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <div className="text-center">
          <Button
            type="submit"
            className={`px-6 py-2 rounded-md shadow text-sm ${
              theme === "dark"
                ? "bg-secondary text-white hover:bg-secondary/90"
                : "bg-primary text-dark hover:bg-primary/90"
            }`}
          >
            {t.register}
          </Button>
        </div>

        {/* Already have account */}
        <div className="text-center text-xs">
          <p
            className={`${
              theme === "dark" ? "text-muted" : "text-background/80"
            }`}
          >
            {t.already_account} {""}
            <Link
              to="/login"
              className={`font-medium underline underline-offset-8 ${
                theme === "dark"
                  ? "text-white hover:text-primary"
                  : "text-background hover:text-secondary"
              }`}
            >
              {t.login}
            </Link>
          </p>
        </div>
      </motion.form>
    </section>
  );
}
