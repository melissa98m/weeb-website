import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";
import {
  MessagesApi,
  SubjectsApi,
  getApiErrorMessage,
  getApiSupportHint,
  mapApiFieldErrors,
} from "../../lib/api";

/* ====================== ANTI-SPAM (front only) ====================== */
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
const COOLDOWN_MS = 30 * 1000;

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
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
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

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [serverHint, setServerHint] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState(null);
  const alertRef = useRef(null);

  const [cooldownSec, setCooldownSec] = useState(
    Math.ceil(cooldownRemainingMs() / 1000)
  );

  const isCoolingDown = cooldownSec > 0;
  useEffect(() => {
    if (!isCoolingDown) return;
    const id = setInterval(() => {
      setCooldownSec(Math.ceil(cooldownRemainingMs() / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isCoolingDown]);

  const loadSubjects = useCallback(() => {
    let active = true;
    setSubjectsError(null);
    (async () => {
      try {
        setLoadingSubjects(true);
        const data = await SubjectsApi.list();
        if (active) {
          setSubjects(Array.isArray(data) ? data : data?.results || []);
        }
      } catch (e) {
        if (active) {
          setSubjectsError(getApiErrorMessage(e, t?.subjects_load_error || "Unable to load subjects."));
        }
      } finally {
        if (active) setLoadingSubjects(false);
      }
    })();
    return () => { active = false; };
  }, [language]);

  useEffect(loadSubjects, [loadSubjects]);

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

    if (!form.subject) {
      e.subject = t?.subject_error || "Invalid subject.";
    } else if (!/^\d+$/.test(String(form.subject))) {
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
    setServerHint(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg(null);
    setServerHint(null);

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

    if (form._website) return;

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
      const firstErrorId = Object.keys(validationErrors)[0];
      setTimeout(() => {
        const el = document.getElementById(firstErrorId);
        if (el) {
          el.scrollIntoView?.({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }, 50);
      return;
    }

    const payload = {
      subject: form.subject ? Number(form.subject) : null,
      telephone: form.telephone.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      message_content: form.message_content.trim(),
    };

    try {
      setSubmitting(true);
      await MessagesApi.create(payload);
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
      setTimeout(() => alertRef.current?.focus(), 50);
    } catch (err) {
      const fieldErrors = mapApiFieldErrors(err, {
        first_name: "first_name",
        last_name: "last_name",
        telephone: "telephone",
        email: "email",
        subject: "subject",
        message_content: "message_content",
      });
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
      }

      const hasFieldErrors = Object.keys(fieldErrors).length > 0;
      setServerMsg({
        type: "error",
        text: hasFieldErrors
          ? getApiErrorMessage(err, t?.sent_error || "Please correct the highlighted fields.")
          : getApiErrorMessage(err, t?.network_error || "Network error. Check your connection."),
      });
      setServerHint(getApiSupportHint(err, language));
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = `w-full rounded-lg border px-3 py-2.5 bg-transparent text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
    isDark
      ? "border-border bg-surface/40 text-white placeholder-white/30 focus:border-primary/60"
      : "border-gray-200 bg-white text-dark placeholder-dark/30 focus:border-secondary/60"
  }`;
  const inputError = "border-red-400/70 focus:border-red-400 focus:ring-red-400/20";
  const labelClass = `block text-xs font-medium mb-1.5 ${isDark ? "text-white/55" : "text-dark/55"}`;

  return (
    <section className="pb-12">
      <motion.form
        onSubmit={handleSubmit}
        className={`w-full rounded-2xl border p-6 sm:p-8 space-y-6 ${
          isDark
            ? "bg-surface/30 border-border"
            : "bg-white border-gray-200 shadow-sm"
        }`}
        animate={shake && !prefersReducedMotion ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        noValidate
      >
        {/* Global alert banner */}
        <div role="alert" aria-live="assertive" ref={alertRef} tabIndex={-1} className="outline-none">
          <AnimatePresence mode="wait">
            {serverMsg && (
              <motion.div
                key={serverMsg.type + serverMsg.text}
                initial={{ opacity: 0, scale: 0.97, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -4 }}
                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                className={`flex items-start gap-3 p-4 rounded-xl text-sm ${
                  serverMsg.type === "success"
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 border border-red-500/20"
                }`}
              >
                {serverMsg.type === "success" ? (
                  <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                <div>
                  {serverMsg.text}
                  {serverHint && serverMsg.type === "error" && (
                    <p className="mt-1 text-xs opacity-80">{serverHint}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cooldown notice */}
        {isCoolingDown && (
          <div
            className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full ${
              isDark ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {t?.cooldown_info || "Next submission available in"}
            <span className="font-mono font-semibold tabular-nums">{cooldownSec}s</span>
          </div>
        )}

        {/* Name row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="last_name" className={labelClass}>{t.name}</label>
            <input
              id="last_name"
              type="text"
              value={form.last_name}
              placeholder={t.name}
              onChange={handleChange}
              maxLength={50}
              autoComplete="family-name"
              className={`${inputBase} ${errors.last_name ? inputError : ""}`}
              aria-invalid={!!errors.last_name}
              aria-required="true"
              aria-describedby={errors.last_name ? "last_name-error" : undefined}
            />
            {errors.last_name && (
              <p id="last_name-error" className="text-red-500 text-xs mt-1.5">{errors.last_name}</p>
            )}
          </div>

          <div>
            <label htmlFor="first_name" className={labelClass}>{t.firstname}</label>
            <input
              id="first_name"
              type="text"
              value={form.first_name}
              placeholder={t.firstname}
              onChange={handleChange}
              maxLength={50}
              autoComplete="given-name"
              className={`${inputBase} ${errors.first_name ? inputError : ""}`}
              aria-invalid={!!errors.first_name}
              aria-required="true"
              aria-describedby={errors.first_name ? "first_name-error" : undefined}
            />
            {errors.first_name && (
              <p id="first_name-error" className="text-red-500 text-xs mt-1.5">{errors.first_name}</p>
            )}
          </div>
        </div>

        {/* Contact row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="telephone" className={labelClass}>{t.phone}</label>
            <input
              id="telephone"
              type="text"
              value={form.telephone}
              placeholder="0612345678"
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleChange({ target: { id: "telephone", value: digits } });
              }}
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel"
              className={`${inputBase} ${errors.telephone ? inputError : ""}`}
              aria-invalid={!!errors.telephone}
              aria-describedby={errors.telephone ? "telephone-error" : undefined}
            />
            {errors.telephone && (
              <p id="telephone-error" className="text-red-500 text-xs mt-1.5">{errors.telephone}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>{t.email}</label>
            <input
              id="email"
              type="email"
              value={form.email}
              placeholder="email@example.com"
              onChange={handleChange}
              autoComplete="email"
              className={`${inputBase} ${errors.email ? inputError : ""}`}
              aria-invalid={!!errors.email}
              aria-required="true"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className={labelClass}>
            {t?.subject || "Sujet"}
          </label>
          <div className="relative">
            <select
              id="subject"
              value={form.subject}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2.5 pr-9 appearance-none cursor-pointer text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20 ${
                isDark
                  ? "border-border bg-surface/40 text-white focus:border-primary/60"
                  : "border-gray-200 bg-white text-dark focus:border-secondary/60"
              } ${errors.subject ? inputError : ""}`}
              aria-invalid={!!errors.subject}
              aria-required="true"
              aria-describedby={errors.subject ? "subject-error" : undefined}
            >
              <option
                value=""
                className={isDark ? "bg-background text-white" : "bg-white text-dark"}
              >
                {t?.subject_placeholder || "Sélectionnez un sujet"}
              </option>
              {loadingSubjects ? (
                <option value="" disabled className={isDark ? "bg-background text-white" : "bg-white text-dark"}>
                  {t?.loading || "Chargement..."}
                </option>
              ) : (
                subjects.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className={isDark ? "bg-background text-white" : "bg-white text-dark"}
                  >
                    {s.name || s.title || `#${s.id}`}
                  </option>
                ))
              )}
            </select>
            <svg
              className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark ? "text-white/40" : "text-dark/40"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {errors.subject && (
            <p id="subject-error" className="text-red-500 text-xs mt-1.5">{errors.subject}</p>
          )}
          {subjectsError && (
            <div className="flex items-center gap-2 mt-1.5">
              <p className="text-red-500 text-xs">{subjectsError}</p>
              <button
                type="button"
                onClick={loadSubjects}
                className="text-xs underline text-red-500 hover:text-red-700"
              >
                {t?.subjects_retry || "Retry"}
              </button>
            </div>
          )}
          {!loadingSubjects && !subjectsError && subjects.length === 0 && (
            <p className={`text-xs mt-1.5 ${isDark ? "text-white/40" : "text-dark/40"}`}>
              {t?.subjects_empty || "No subjects available at the moment."}
            </p>
          )}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message_content" className={labelClass}>{t.message}</label>
          <textarea
            id="message_content"
            rows={5}
            value={form.message_content}
            placeholder={t.message}
            onChange={handleChange}
            maxLength={5000}
            className={`${inputBase} ${errors.message_content ? inputError : ""} resize-none sm:resize-y`}
            aria-invalid={!!errors.message_content}
            aria-required="true"
            aria-describedby={
              errors.message_content ? "message_content-error" : "message_content-count"
            }
          />
          <div className="flex justify-between items-start mt-1.5">
            {errors.message_content ? (
              <p id="message_content-error" className="text-red-500 text-xs">{errors.message_content}</p>
            ) : (
              <span />
            )}
            <p
              id="message_content-count"
              className={`text-xs ml-auto transition-colors ${
                form.message_content.length >= 4800
                  ? "text-red-500 font-medium"
                  : form.message_content.length >= 4000
                  ? "text-amber-500"
                  : isDark ? "text-white/30" : "text-dark/30"
              }`}
            >
              {form.message_content.length} / 5000
            </p>
          </div>
        </div>

        {/* Honeypot — invisible to real users */}
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
        <motion.div
          className="space-y-2 text-xs rounded-xl p-3 -mx-1"
          animate={{
            backgroundColor: form.consent
              ? isDark
                ? "rgba(192, 132, 252, 0.07)"
                : "rgba(147, 51, 234, 0.04)"
              : "rgba(0,0,0,0)",
          }}
          transition={{ duration: 0.4 }}
        >
          <p className={isDark ? "text-white/50" : "text-dark/50"}>
            {t?.privacy_notice || "Your data is used only to process your request."}
          </p>
          <label className="flex items-start gap-3 min-h-[44px] py-2 cursor-pointer">
            <input
              id="consent"
              type="checkbox"
              checked={form.consent}
              onChange={handleChange}
              className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4 accent-secondary shrink-0"
              aria-invalid={!!errors.consent}
              aria-required="true"
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span className={isDark ? "text-white/70" : "text-dark/70"}>
              {t?.consent_label || "I agree to the processing of my data for this request."}
            </span>
          </label>
          {errors.consent && (
            <p id="consent-error" className="text-red-500 text-xs">{errors.consent}</p>
          )}
        </motion.div>

        {/* Submit */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full sm:w-auto px-8 py-3 min-h-[44px] rounded-xl font-semibold text-sm text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              isDark
                ? "bg-secondary hover:bg-secondary/85 focus-visible:ring-offset-background"
                : "bg-secondary hover:bg-secondary/90 focus-visible:ring-offset-white"
            } ${submitting ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                {t?.sending || "Envoi…"}
              </span>
            ) : (
              t?.contact_cta || "Contact"
            )}
          </button>
        </div>
      </motion.form>
    </section>
  );
}
