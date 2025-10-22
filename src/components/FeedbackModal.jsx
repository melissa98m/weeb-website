// src/components/Modals/FeedbackModal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { ensureCsrf } from "../lib/api";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function FeedbackModal({
  open,
  onClose,
  userId,
  formation,              // { id, name }
  theme = "light",
  language = "fr",
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(false);

  const t = language === "fr"
    ? {
        title: "Laisser un feedback",
        label: "Votre feedback",
        placeholder: "Laissez votre feedback…",
        cancel: "Annuler",
        send: "Envoyer",
        success: "Merci ! Votre feedback a été envoyé.",
        required: "Le feedback est requis.",
      }
    : {
        title: "Leave feedback",
        label: "Your feedback",
        placeholder: "Write your feedback…",
        cancel: "Cancel",
        send: "Send",
        success: "Thanks! Your feedback has been sent.",
        required: "Feedback is required.",
      };

  useEffect(() => {
    if (!open) return;
    setContent("");
    setSending(false);
    setErr(null);
    setOk(false);
    const onEsc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const submit = useCallback(async () => {
    if (!userId || !formation?.id) return;
    const msg = content.trim();
    if (!msg) {
      setErr(t.required);
      return;
    }
    try {
      setSending(true);
      setErr(null);
      setOk(false);
      const csrf = await ensureCsrf();
      const res = await fetch(`${API_BASE}/feedbacks/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrf,
        },
        body: JSON.stringify({
          user: userId,
          formation: formation.id,
          feedback_content: msg,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || `HTTP ${res.status}`);
      }
      setOk(true);
      // ferme la modale après un petit délai
      setTimeout(() => onClose?.(), 900);
    } catch (e) {
      setErr(String(e.message || e) || "Failed to send feedback.");
    } finally {
      setSending(false);
    }
  }, [userId, formation, content, onClose, t.required]);

  if (!open) return null;

  const frame =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg rounded-xl border shadow ${frame}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-xl font-semibold">
              {t.title} {formation?.name ? `— ${formation.name}` : ""}
            </h3>
            <button
              onClick={onClose}
              className={`px-2 py-1 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <label className="block text-sm mb-2">{t.label}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className={`w-full resize-y rounded-md border px-3 py-2 outline-none ${
              theme === "dark"
                ? "bg-[#1c1c1c] border-[#333] text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
            }`}
            placeholder={t.placeholder}
          />

          {err && (
            <p className="mt-2 text-sm text-red-500">{String(err)}</p>
          )}
          {ok && (
            <p className="mt-2 text-sm text-green-600">{t.success}</p>
          )}

          <div className="mt-4 flex items-center gap-3 justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {t.cancel}
            </button>
            <button
              onClick={submit}
              disabled={sending}
              className={`px-4 py-2 rounded-md shadow text-sm ${
                sending ? "opacity-70 cursor-not-allowed" : ""
              } ${
                theme === "dark"
                  ? "bg-secondary text-white hover:bg-secondary/90"
                  : "bg-primary text-dark hover:bg-primary/90"
              }`}
            >
              {sending ? (language === "fr" ? "Envoi…" : "Sending…") : t.send}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
