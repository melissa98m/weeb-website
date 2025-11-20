import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
      map.form =
        d.non_field_errors?.join(" ") ||
        d.detail ||
        (language === "fr" ? "Échec de l’inscription." : "Registration failed.");
      setErrors(map);
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
    <section
      className={`min-h-screen flex items-center justify-center px-6 py-12 ${
        theme === "dark" ? "text-white" : "text-background"
      }`}
    >
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-3xl p-6 rounded-md border text-sm space-y-6 ${
          theme === "dark" ? "bg-[#C084FC1A] border-primary" : "bg-light border-secondary"
        }`}
      >
        <h1 className="text-3xl font-bold text-center">{t.register}</h1>

        {errors.form && (
          <div className="text-sm rounded-md p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {errors.form}
          </div>
        )}

        {/* Username */}
        <div>
          <label htmlFor="username" className="block font-medium mb-2">
            {t.username}
          </label>
          <input
            id="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className={fieldClass(!!errors.username)}
            placeholder={t.username_placeholder}
          />
          {errors.username && <p className="mt-2 text-sm text-red-500">{errors.username}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label htmlFor="nom" className="block font-medium mb-2">
              {t.name}
            </label>
            <input id="nom" type="text" value={form.nom} onChange={handleChange} className={fieldClass(!!errors.nom)} />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
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
              className={fieldClass(!!errors.prenom)}
            />
            {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
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
              className={fieldClass(!!errors.email)}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
              placeholder={t.phone_placeholder}
              className={fieldClass(!!errors.telephone)}
            />
            {errors.telephone && <p className="mt-2 text-sm text-red-500">{errors.telephone}</p>}
            <p className={`mt-1 text-xs ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>
              {t.phone_hint ||
                (language === "fr"
                  ? "Exemples valides : +33 6 12 34 56 78 ou (06) 12-34-56-78"
                  : "Valid examples: +1 212 555 0123 or (212) 555-0123")}
            </p>
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block font-medium mb-2">
            {t.password}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className={`${fieldClass(!!errors.password)} pr-20`}
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
              {showPwd ? t.hide : t.show}
            </Button>
          </div>

          <ul className="mt-2 space-y-1 text-xs">
            <li className={`flex items-center ${pwdValidations.length ? "text-green-500" : "text-red-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pwdValidations.length ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.min_caractere}</span>
            </li>
            <li className={`flex items-center ${pwdValidations.uppercase ? "text-green-500" : "text-red-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pwdValidations.uppercase ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.uppercase}</span>
            </li>
            <li className={`flex items-center ${pwdValidations.number ? "text-green-500" : "text-red-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pwdValidations.number ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.number}</span>
            </li>
            <li className={`flex items-center ${pwdValidations.special ? "text-green-500" : "text-red-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${pwdValidations.special ? "bg-green-500" : "bg-red-500"}`} />
              <span className="ml-2">{t.specialchar}</span>
            </li>
          </ul>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block font-medium mb-2">
            {t.confirm_password}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPwd ? "text" : "password"}
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${fieldClass(!!errors.confirmPassword)} pr-20`}
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
              {showConfirmPwd ? t.hide : t.show}
            </Button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Submit */}
        <div className="text-center">
          <Button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded-md shadow text-sm ${
              theme === "dark"
                ? "bg-secondary text-white hover:bg-secondary/90"
                : "bg-primary text-dark hover:bg-primary/90"
            } ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {submitting
              ? language === "fr"
                ? "Création du compte…"
                : "Creating account…"
              : t.register}
          </Button>
        </div>

        {/* Already have account */}
        <div className="text-center text-xs">
          <p className={`${theme === "dark" ? "text-muted" : "text-background/80"}`}>
            {t.already_account}{" "}
            <Link
              to="/login"
              className={`font-medium underline underline-offset-8 ${
                theme === "dark" ? "text-white hover:text-primary" : "text-background hover:text-secondary"
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
