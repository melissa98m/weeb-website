import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../lib/api";

/* ====================== ANTI-SPAM (front only) ====================== */
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min
const RATE_LIMIT_MAX = 3;                    // max 3 envois par fenêtre
const COOLDOWN_MS = 30 * 1000;               // 30 s entre deux envois

const getNow = () => Date.now();
const getSubmits = () => {
  try { return JSON.parse(localStorage.getItem("contact_submissions") || "[]"); }
  catch { return []; }
};
const saveSubmits = (arr) => localStorage.setItem("contact_submissions", JSON.stringify(arr));
const recentSubmits = () => {
  const now = getNow();
  return getSubmits().filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
};
const lastSubmitTs = () => {
  const arr = recentSubmits();
  return arr.length ? arr[arr.length - 1] : 0;
};
const cooldownRemainingMs = () => {
  const last = lastSubmitTs();
  if (!last) return 0;
  const diff = getNow() - last;
  return diff < COOLDOWN_MS ? COOLDOWN_MS - diff : 0;
};
const canSubmitNow = () => {
  const arr = recentSubmits();
  const last = arr.length ? arr[arr.length - 1] : 0;
  if (arr.length >= RATE_LIMIT_MAX) return { ok: false, reason: "rate" };
  if (last && getNow() - last < COOLDOWN_MS) {
    return { ok: false, reason: "cooldown", waitMs: COOLDOWN_MS - (getNow() - last) };
  }
  return { ok: true, arr };
};
const recordSubmit = () => {
  const arr = recentSubmits();
  arr.push(getNow());
  saveSubmits(arr);
};
/* ==================================================================== */

export default function ContactForm() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? contactFr : contactEn;

  // Champs alignés avec le modèle Django
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    telephone: "",
    email: "",
    subject: "",
    message_content: "",
    consent: false,
    _website: "",            // honeypot (doit rester vide)
    _started_at: Date.now(), // garde-temps minimal
  });

  // Erreurs: { field: "message" }
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Cooldown restant en secondes pour informer l'utilisateur
  const [cooldownSec, setCooldownSec] = useState(
    Math.ceil(cooldownRemainingMs() / 1000)
  );

  // Tick chaque seconde pour mettre a jour le cooldown affiche
  useEffect(() => {
    const id = setInterval(() => {
      setCooldownSec(Math.ceil(cooldownRemainingMs() / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

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
        setServerMsg({ type: "error", text: t?.subjects_load_error || "Unable to load subjects." });
      } finally {
        setLoadingSubjects(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Validation front
  const validate = () => {
    const e = {};
    if (!form.last_name.trim()) e.last_name = t?.lastname_error || "Last name is required.";
    else if (form.last_name.trim().length > 50) e.last_name = t?.lastname_max || "Max 50 characters.";

    if (!form.first_name.trim()) e.first_name = t?.firstname_error || "First name is required.";
    else if (form.first_name.trim().length > 50) e.first_name = t?.firstname_max || "Max 50 characters.";

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim()))
      e.email = t?.email_error || "Invalid email.";

    const tel = form.telephone.trim();
    if (tel) {
      if (!/^\d{6,10}$/.test(tel)) e.telephone = t?.phone_error || "Phone must be 6 to 10 digits.";
      if (tel.length > 10) e.telephone = t?.phone_max || "Max 10 digits.";
    }

    if (!form.message_content.trim()) e.message_content = t?.message_error || "Message is required.";
    else if (form.message_content.trim().length > 5000) e.message_content = t?.message_max || "Max 5000 characters.";

    if (form.subject && !/^\d+$/.test(String(form.subject))) {
      e.subject = t?.subject_error || "Invalid subject.";
    }

    if (!form.consent) {
      e.consent = t?.consent_error || "Consent is required.";
    }

    return e;
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [id]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [id]: null }));
    setServerMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg(null);

    // Anti-spam 1: rate-limit navigateur
    const gate = canSubmitNow();
    if (!gate.ok) {
      setServerMsg({
        type: "error",
        text:
          gate.reason === "rate"
            ? (t?.too_many || "Trop de tentatives. Réessayez plus tard.")
            : (t?.cooldown || `Patientez ${Math.ceil((gate.waitMs || 0) / 1000)} s avant un nouvel envoi.`),
      });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    // Anti-spam 2: honeypot
    if (form._website) {
      // Bot probable. On ne dit rien. On sort.
      return;
    }

    // Anti-spam 3: garde-temps minimal
    if (Date.now() - form._started_at < 2000) {
      setServerMsg({ type: "error", text: t?.too_fast || "Formulaire envoyé trop vite." });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

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
      consent: undefined,
      subject: form.subject ? Number(form.subject) : null,
      telephone: form.telephone.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      message_content: form.message_content.trim(),
    };

    try {
      setSubmitting(true);
      const r = await fetch(`${API_BASE}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (r.ok) {
        // Enregistrement client de la soumission pour le rate-limit
        recordSubmit();
        setCooldownSec(Math.ceil(cooldownRemainingMs() / 1000));

        setForm({
          first_name: "",
          last_name: "",
          telephone: "",
          email: "",
          subject: "",
          message_content: "",
          consent: false,
          _website: "",
          _started_at: Date.now(),
        });
        setErrors({});
        setServerMsg({ type: "success", text: t?.sent_ok || "Message sent. Thank you!" });
        return;
      }

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
        if (data.non_field_errors && data.non_field_errors.length) {
          setServerMsg({ type: "error", text: data.non_field_errors.join(" ") });
        } else {
          setServerMsg({ type: "error", text: t?.sent_error || "Please correct the highlighted fields." });
        }
        return;
      }

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
        {/* Message global */}
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

        {/* Info cooldown si actif */}
        {cooldownSec > 0 && (
          <div className="text-xs">
            {t?.cooldown_info || "Veuillez patienter avant un nouvel envoi."} {cooldownSec}s
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Last Name */}
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

          {/* First Name */}
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

          {/* Telephone */}
          <div className="relative">
            <input
              id="telephone"
              type="text"
              value={form.telephone}
              placeholder={t.phone}
              onChange={(e) => {
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

          {/* Subject */}
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

        {/* Message */}
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

        {/* Honeypot invisible */}
        <div className="hidden" aria-hidden="true">
          <input
            id="_website"
            type="text"
            value={form._website}
            onChange={(e) => setForm((p) => ({ ...p, _website: e.target.value }))}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* RGPD consent */}
        <div className="space-y-2 text-xs">
          <p className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>
            {t?.privacy_notice || "Your data is used only to process your request."}
          </p>
          <label className="flex items-start gap-2">
            <input
              id="consent"
              type="checkbox"
              checked={form.consent}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 accent-slate-600"
              aria-invalid={!!errors.consent}
            />
            <span>{t?.consent_label || "I agree to the processing of my data for this request."}</span>
          </label>
          {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}
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
