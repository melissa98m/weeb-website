import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Button from "../../components/Button";

export default function FormationModal({ open, onClose, formation, theme, t }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !formation) return null;

  const title = formation?.name || "";
  const description = formation?.description || "";

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const metaColor = theme === "dark" ? "text-white/80" : "text-gray-700";

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl rounded-xl border shadow-lg ${card}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-xl md:text-2xl font-semibold">{title}</h3>
            <Button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 rounded-md border text-sm ${
                theme === "dark"
                  ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
                  : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
              }`}
              aria-label={t.close}
              title={t.close}
              autoFocus
            >
              ✕ {t.close}
            </Button>
          </div>

          {description ? (
            <p className={`${metaColor} whitespace-pre-line`}>{description}</p>
          ) : (
            <p className={metaColor}>—</p>
          )}

          {/* Bloc CTA Contact */}
          <div
            className={`mt-6 p-4 rounded-lg border ${
              theme === "dark" ? "border-primary/40 bg-[#262626]" : "border-secondary/40 bg-white"
            }`}
          >
            <p className="mb-3">
              Pour vous inscrire ou avoir plus de details sur cette formation, contacter nous.
            </p>
            <Button
              to="/contact"
              className={`px-4 py-2 rounded-md shadow text-sm hover:brightness-110 ${
                theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
              }`}
            >
              {t.contact_us}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
