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
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())) errs.email = t.email_error;
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

  return (
    <section className="px-6 pb-20 flex justify-center">
      <motion.form
        onSubmit={handleSubmit}
        className={`w-full max-w-3xl p-6 rounded-md border text-sm space-y-6
          ${theme === "dark" ? "bg-[#C084FC1A] border-primary" : "bg-light border-secondary"}`}
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom */}
          <div>
            <label htmlFor="nom" className={`block mb-1 ${theme === "dark" ? "text-primary" : "text-secondary"}`}>
              {t.name}
            </label>
            <input
              id="nom"
              type="text"
              value={form.nom}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none ${
                errors.nom ? "border-red-500" : theme === "dark" ? "border-primary focus:border-primary" : "border-secondary focus:border-secondary"
              }`}
            />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
          </div>

          {/* Prénom */}
           <div>
            <label htmlFor="prenom" className={`block mb-1 ${theme === "dark" ? "text-primary" : "text-secondary"}`}>
              {t.firstname}
            </label>
            <input
              id="prenom"
              type="text"
              value={form.prenom}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none ${
                errors.prenom ? "border-red-500" : theme === "dark" ? "border-primary focus:border-primary" : "border-secondary focus:border-secondary"
              }`}
            />
            {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
          </div>

          {/* Téléphone */}
          <div>
            <label htmlFor="telephone" className={`block mb-1 ${theme === "dark" ? "text-primary" : "text-secondary"}`}>
              {t.phone}
            </label>
            <input
              id="telephone"
              type="text"
              value={form.telephone}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none ${
                errors.telephone ? "border-red-500" : theme === "dark" ? "border-primary focus:border-primary" : "border-secondary focus:border-secondary"
              }`}
            />
            {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={`block mb-1 ${theme === "dark" ? "text-primary" : "text-secondary"}`}>
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-1 focus:outline-none ${
                errors.email ? "border-red-500" : theme === "dark" ? "border-primary focus:border-primary" : "border-secondary focus:border-secondary"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className={`block mb-1 ${theme === "dark" ? "text-primary" : "text-secondary"}`}>
            {t.message}
          </label>
          <textarea
            id="message"
            rows="3"
            value={form.message}
            onChange={handleChange}
            className={`w-full bg-transparent border-b py-1 resize-none focus:outline-none ${
              errors.message ? "border-red-500" : theme === "dark" ? "border-primary focus:border-primary" : "border-secondary focus:border-secondary"
            }`}
          />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
        </div>

        {/* Submit */}
        <div className="text-center">
          <motion.button
            type="submit"
            className={`px-6 py-2 rounded-md shadow transition ${
              theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
           Contact
          </motion.button>
        </div>
      </motion.form>
    </section>
  );
}
