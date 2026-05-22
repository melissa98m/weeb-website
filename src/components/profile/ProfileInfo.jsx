import React from "react";

export default function ProfileInfo({ user, t, theme, onRefresh, onSignout }) {
  const isDark = theme === "dark";
  const initial = (user.first_name?.[0] || user.username?.[0] || "?").toUpperCase();

  const fieldMuted = isDark ? "text-white/45" : "text-dark/45";
  const fieldValue = isDark ? "text-white font-medium" : "text-dark font-medium";

  const fields = [
    { label: t.username, value: user.username },
    { label: t.email, value: user.email },
    { label: t.firstName, value: user.first_name },
    { label: t.lastName, value: user.last_name },
  ];

  return (
    <section
      className={`rounded-2xl border p-6 ${
        isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* Header row: avatar + title + actions */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold font-display shrink-0 select-none ${
              isDark ? "bg-primary/15 text-primary" : "bg-secondary/10 text-secondary"
            }`}
            aria-hidden="true"
          >
            {initial}
          </div>
          <h1
            className={`font-display font-extrabold text-xl ${
              isDark ? "text-white" : "text-dark"
            }`}
          >
            {t.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isDark
                ? "border-border text-white/60 hover:bg-white/5 hover:text-white"
                : "border-gray-200 text-dark/60 hover:bg-gray-50 hover:text-dark"
            }`}
          >
            {t.refresh}
          </button>
          <button
            type="button"
            onClick={onSignout}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isDark
                ? "bg-white/5 text-white/70 hover:bg-white/10"
                : "bg-gray-100 text-dark/70 hover:bg-gray-200"
            }`}
          >
            {t.signout}
          </button>
        </div>
      </div>

      {/* Field grid */}
      <div className={`border-t pt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 ${isDark ? "border-border" : "border-gray-100"}`}>
        {fields.map(({ label, value }) => (
          <div key={label}>
            <p className={`text-xs mb-0.5 ${fieldMuted}`}>{label}</p>
            <p className={`text-sm break-all ${fieldValue}`}>{value || "—"}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
