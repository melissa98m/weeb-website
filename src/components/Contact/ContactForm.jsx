import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";

export default function ContactForm() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? contactFr : contactEn;

  // Form state and errors
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = t.name_error;
    if (!form.prenom.trim()) errs.prenom = t.firstname;
    if (!/^[0-9+ ]{6,15}$/.test(form.telephone)) errs.telephone = t.phone_error;
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim()))
      errs.email = t.email_error;
    if (!form.message.trim()) errs.message = t.message_error;
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    console.log("send", form);
  };

  const baseInputClasses = `w-full bg-transparent border-b py-2 placeholder-transparent focus:outline-none ${theme === "dark" ? "border-primary focus:border-primary" : "border-secondary focus:border-secondary"}`;
  const errorBorder = "border-red-500 focus:border-red-500";
  const labelTextColor = theme === "dark" ? "text-primary" : "text-secondary";

  return (
    <section className="px-6 pb-20 flex justify-center">
      <motion.form
        onSubmit={handleSubmit}
        className={`w-full max-w-3xl p-6 rounded-md border text-sm space-y-6
          ${
            theme === "dark"
              ? "bg-[#C084FC1A] border-primary"
              : "bg-light border-secondary"
          }`}
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div className="relative">
            <input
              id="nom"
              type="text"
              value={form.nom}
              placeholder={t.name}
              onChange={handleChange}
              className={`${baseInputClasses} ${errors.nom ? errorBorder : ""} peer`}
            />
            <label
              htmlFor="nom"
              className={`absolute left-[45%] -top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.name}
            </label>
            {errors.nom && (
              <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
            )}
          </div>

          {/* Prénom */}
          <div className="relative">
            <input
              id="prenom"
              type="text"
              value={form.prenom}
              placeholder={t.firstname}
              onChange={handleChange}
              className={`${baseInputClasses} ${errors.prenom ? errorBorder : ""} peer`}
            />
            <label
              htmlFor="prenom"
              className={`absolute left-[45%] -top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.firstname}
            </label>
            {errors.prenom && (
              <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
            )}
          </div>

          {/* Téléphone */}
          <div className="relative">
            <input
              id="telephone"
              type="text"
              value={form.telephone}
              placeholder={t.phone}
              onChange={handleChange}
              className={`${baseInputClasses} ${errors.telephone ? errorBorder : ""} peer`}
            />
            <label
              htmlFor="telephone"
              className={`absolute left-[45%] -top-5 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.phone}
            </label>
            {errors.telephone && (
              <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              id="email"
              type="email"
              value={form.email}
              placeholder={t.email}
              onChange={handleChange}
              className={`${baseInputClasses} ${errors.email ? errorBorder : ""} peer`}
            />
            <label
              htmlFor="email"
              className={`absolute left-[45%] -top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.email}
            </label>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="relative">
          <textarea
            id="message"
            rows="3"
            value={form.message}
            placeholder={t.message}
            onChange={handleChange}
            className={`${baseInputClasses} ${errors.message ? errorBorder : ""} peer resize-none`}
          />
          <label
            htmlFor="message"
            className={`absolute left-[45%] top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
          >
            {t.message}
          </label>
          {errors.message && (
            <p className="text-red-500 text-xs mt-1">{errors.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            className={`px-6 py-2 rounded-md shadow transition-transform transition-colors duration-200 ease-in-out transform hover:scale-110 focus:outline-none ${
              theme === "dark"
                ? "bg-secondary text-white hover:bg-secondary/70"
                : "bg-primary text-dark hover:bg-primary/70"
            }`}
          >
            Contact
          </button>
        </div>
      </motion.form>
    </section>
  );
}
