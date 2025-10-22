import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL;

export default function ContactForm() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? contactFr : contactEn;

  // Champs alignés avec le modèle Django
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    telephone: "",       // optionnel (max_length=10)
    email: "",
    subject: "",         // id (ForeignKey) ou "" pour null
    message_content: "",
  });

  // Erreurs: { field: "message" } (client + serveur DRF)
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState(null); // succès/erreur globale
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Charger la liste des sujets (ForeignKey)
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingSubjects(true);
        const r = await fetch(`${API_BASE}/subjects/`);
        if (!r.ok) throw new Error("Failed to load subjects");
        const data = await r.json();
        if (active) setSubjects(Array.isArray(data) ? data : data.results || []);
      } catch (e) {
        // on affiche juste un message global discret
        setServerMsg({ type: "error", text: t?.subjects_load_error || "Unable to load subjects." });
      } finally {
        setLoadingSubjects(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Validation front cohérente avec le modèle
  const validate = () => {
    const e = {};

    // last_name (Nom) et first_name (Prénom) requis, <= 50
    if (!form.last_name.trim()) e.last_name = t?.lastname_error || "Last name is required.";
    else if (form.last_name.trim().length > 50) e.last_name = t?.lastname_max || "Max 50 characters.";

    if (!form.first_name.trim()) e.first_name = t?.firstname_error || "First name is required.";
    else if (form.first_name.trim().length > 50) e.first_name = t?.firstname_max || "Max 50 characters.";

    // email requis (Django EmailField vérifiera aussi)
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim()))
      e.email = t?.email_error || "Invalid email.";

    // telephone optionnel: si rempli => digits only, <= 10
    const tel = form.telephone.trim();
    if (tel) {
      if (!/^\d{6,10}$/.test(tel)) {
        e.telephone = t?.phone_error || "Phone must be 6 to 10 digits.";
      }
      if (tel.length > 10) {
        e.telephone = t?.phone_max || "Max 10 digits.";
      }
    }

    // message_content requis, <= 5000
    if (!form.message_content.trim()) e.message_content = t?.message_error || "Message is required.";
    else if (form.message_content.trim().length > 5000) e.message_content = t?.message_max || "Max 5000 characters.";

    // subject optionnel (ForeignKey): si non vide, doit être un id numérique
    if (form.subject && !/^\d+$/.test(String(form.subject))) {
      e.subject = t?.subject_error || "Invalid subject.";
    }

    return e;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: null }));
    setServerMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Normaliser les données pour l’API (subject null si vide)
    const payload = {
      ...form,
      subject: form.subject ? Number(form.subject) : null,
      telephone: form.telephone.trim(), // <=10, digits only côté front
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      message_content: form.message_content.trim(),
    };

    try {
      setSubmitting(true);
      const r = await fetch(`${API_BASE}/messages/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // utile si cookies/CSRF
      });

      if (r.ok) {
        setForm({
          first_name: "",
          last_name: "",
          telephone: "",
          email: "",
          subject: "",
          message_content: "",
        });
        setErrors({});
        setServerMsg({ type: "success", text: t?.sent_ok || "Message sent. Thank you!" });
        return;
      }

      // Erreurs DRF typiques: { field: ["msg1", "msg2"], non_field_errors: ["..."] }
      if (r.status === 400) {
        const data = await r.json();
        const fieldErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          if (Array.isArray(val) && val.length) fieldErrors[key] = val.join(" ");
          else if (typeof val === "string") fieldErrors[key] = val;
        });
        setErrors(fieldErrors);
        setShake(true);
        setTimeout(() => setShake(false), 500);

        // Message global lisible si non_field_errors
        if (data.non_field_errors && data.non_field_errors.length) {
          setServerMsg({ type: "error", text: data.non_field_errors.join(" ") });
        } else {
          setServerMsg({ type: "error", text: t?.sent_error || "Please correct the highlighted fields." });
        }
        return;
      }

      // Autres erreurs (500, 403, etc.)
      setServerMsg({ type: "error", text: t?.server_error || "Server error. Please try again later." });
    } catch (err) {
      setServerMsg({ type: "error", text: t?.network_error || "Network error. Check your connection." });
    } finally {
      setSubmitting(false);
    }
  };

  const baseInputClasses = `w-full bg-transparent border-b py-2 placeholder-transparent focus:outline-none ${
    theme === "dark"
      ? "border-primary focus:border-primary"
      : "border-secondary focus:border-secondary"
  }`;
  const errorBorder = "border-red-500 focus:border-red-500";
  const labelTextColor = theme === "dark" ? "text-primary" : "text-secondary";

  return (
    <section className="px-6 pb-20 flex justify-center">
      <motion.form
        onSubmit={handleSubmit}
        className={`w-full max-w-3xl p-6 rounded-md border text-sm space-y-6 ${
          theme === "dark"
            ? "bg-[#C084FC1A] border-primary"
            : "bg-light border-secondary"
        }`}
        animate={shake ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        noValidate
      >
        {/* Message global succès/erreur */}
        {serverMsg && (
          <div
            className={`p-3 rounded text-sm ${
              serverMsg.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {serverMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Last Name (Nom) -> last_name */}
          <div className="relative">
            <input
              id="last_name"
              type="text"
              value={form.last_name}
              placeholder={t.name}
              onChange={handleChange}
              maxLength={50}
              className={`${baseInputClasses} ${errors.last_name ? errorBorder : ""} peer`}
              aria-invalid={!!errors.last_name}
            />
            <label
              htmlFor="last_name"
              className={`absolute left-[45%] -top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.name}
            </label>
            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
          </div>

          {/* First Name (Prénom) -> first_name */}
          <div className="relative">
            <input
              id="first_name"
              type="text"
              value={form.first_name}
              placeholder={t.firstname}
              onChange={handleChange}
              maxLength={50}
              className={`${baseInputClasses} ${errors.first_name ? errorBorder : ""} peer`}
              aria-invalid={!!errors.first_name}
            />
            <label
              htmlFor="first_name"
              className={`absolute left-[45%] -top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.firstname}
            </label>
            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
          </div>

          {/* Telephone (optionnel, <=10 digits) */}
          <div className="relative">
            <input
              id="telephone"
              type="text"
              value={form.telephone}
              placeholder={t.phone}
              onChange={(e) => {
                // autoriser uniquement digits, couper à 10
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleChange({ target: { id: "telephone", value: digits } });
              }}
              inputMode="numeric"
              maxLength={10}
              className={`${baseInputClasses} ${errors.telephone ? errorBorder : ""} peer`}
              aria-invalid={!!errors.telephone}
            />
            <label
              htmlFor="telephone"
              className={`absolute left-[45%] -top-5 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.phone}
            </label>
            {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
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
              aria-invalid={!!errors.email}
            />
            <label
              htmlFor="email"
              className={`absolute left-[45%] -top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
            >
              {t.email}
            </label>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Subject (optionnel) */}
          <div className="relative md:col-span-2">
            <select
              id="subject"
              value={form.subject}
              onChange={handleChange}
              className={`w-full bg-transparent border-b py-2 focus:outline-none ${
                theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              } ${errors.subject ? errorBorder : ""}`}
              aria-invalid={!!errors.subject}
            >
              <option value="">{t?.subject_placeholder || "Select a subject"}</option>
              {loadingSubjects ? (
                <option value="" disabled>{t?.loading || "Loading..."}</option>
              ) : (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.title || `#${s.id}`}
                  </option>
                ))
              )}
            </select>
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
          </div>
        </div>

        {/* Message -> message_content */}
        <div className="relative">
          <textarea
            id="message_content"
            rows="3"
            value={form.message_content}
            placeholder={t.message}
            onChange={handleChange}
            maxLength={5000}
            className={`${baseInputClasses} ${errors.message_content ? errorBorder : ""} peer resize-none`}
            aria-invalid={!!errors.message_content}
          />
          <label
            htmlFor="message_content"
            className={`absolute left-[45%] top-2 pointer-events-none transition-all ${labelTextColor} peer-focus:-top-5 peer-focus:text-xs peer-focus:font-medium`}
          >
            {t.message}
          </label>
          {errors.message_content && <p className="text-red-500 text-xs mt-1">{errors.message_content}</p>}
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded-md shadow transition-transform transition-colors duration-200 ease-in-out transform hover:scale-110 focus:outline-none ${
              theme === "dark"
                ? "bg-secondary text-white hover:bg-secondary/70"
                : "bg-primary text-dark hover:bg-primary/70"
            } ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {submitting ? (t?.sending || "Sending...") : (t?.contact_cta || "Contact")}
          </button>
        </div>
      </motion.form>
    </section>
  );
}
