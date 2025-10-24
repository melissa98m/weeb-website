import React, { useEffect, useState } from "react";
import feedbackFr from "../../locales/fr/feedback.json";
import feedbackEn from "../../locales/en/feedback.json";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function FeedbackModal({
  open,
  onClose,
  userId,
  formation,
  theme,
  language,
  onSuccess
}) {
  const t = language === "fr" ? feedbackFr : feedbackEn;
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!open) {
      setContent("");
      setErr(null);
      setSending(false);
    }
  }, [open]);

  if (!open || !formation || !userId) return null;

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  const send = async () => {
    try {
      setSending(true);
      setErr(null);
      const res = await fetch(`${API_BASE}/feedbacks/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: userId,
          formation: formation.id,
          feedback_content: content.trim()
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      onSuccess?.(created);
      onClose();
    } catch (e) {
      setErr(t.error);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-lg rounded-xl border shadow ${card}`}
      >
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-1">{t.title}</h3>
          <p className="text-sm opacity-70 mb-4">{formation.name}</p>

          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.placeholder}
            className={`w-full resize-y rounded-md border px-3 py-2 outline-none ${
              theme === "dark"
                ? "bg-[#0f0f0f] border-[#333] text-white placeholder-white/40"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
            }`}
          />

          {err && (
            <div className="text-sm text-red-500 mt-2">{err}</div>
          )}

          <div className="mt-4 flex justify-end gap-2">
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
              onClick={send}
              disabled={sending || !content.trim()}
              className={`px-4 py-2 rounded-md shadow text-sm ${
                theme === "dark"
                  ? "bg-secondary text-white disabled:opacity-50"
                  : "bg-primary text-dark disabled:opacity-50"
              }`}
            >
              {sending ? "…" : t.send}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
