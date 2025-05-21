import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function ContactForm() {
  const { theme } = useTheme();

  // État du formulaire et des erreurs
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);

  // Validation simple
  const validate = () => {
    const errs = {};
    if (!form.nom.trim()) errs.nom = "Veuillez entrer votre nom";
    if (!form.prenom.trim()) errs.prenom = "Veuillez entrer votre prénom";
    if (!/^[0-9+ ]{6,15}$/.test(form.telephone))
      errs.telephone = "Téléphone invalide";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim()))
      errs.email = "Email invalide";
    if (!form.message.trim()) errs.message = "Veuillez entrer un message";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    // Clear error on change
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
      {/* Shake if the all form is error */}
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
          {["nom", "prenom", "telephone", "email"].map((field) => (
            <div key={field}>
              <label
                htmlFor={field}
                className={`block mb-1 ${
                  theme === "dark" ? "text-primary" : "text-secondary"
                }`}
              >
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                id={field}
                value={form[field]}
                onChange={handleChange}
                className={`w-full bg-transparent border-b py-1 focus:outline-none
                  ${
                    errors[field]
                      ? "border-red-500"
                      : theme === "dark"
                      ? "border-primary focus:border-primary"
                      : "border-secondary focus:border-secondary"
                  }`}
              />
              {errors[field] && (
                <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
              )}
            </div>
          ))}
        </div>

        <div>
          <label
            htmlFor="message"
            className={`block mb-1 ${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            Message
          </label>
          <textarea
            id="message"
            rows="3"
            value={form.message}
            onChange={handleChange}
            className={`w-full bg-transparent border-b py-1 resize-none focus:outline-none
              ${
                errors.message
                  ? "border-red-500"
                  : theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              }`}
          />
          {errors.message && (
            <p className="text-red-500 text-xs mt-1">{errors.message}</p>
          )}
        </div>

        <div className="text-center">
          <motion.button
            type="submit"
            className={`px-6 py-2 rounded-md shadow transition ${
              theme === "dark"
                ? "bg-secondary text-white"
                : "bg-primary text-dark"
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
