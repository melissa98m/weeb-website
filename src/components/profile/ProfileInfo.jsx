import React from "react";

export default function ProfileInfo({ user, t, theme, onRefresh, onSignout }) {
  const isDark = theme === "dark";

  const fields = [
    { label: t.username,   value: user.username   },
    { label: t.email,      value: user.email      },
    { label: t.firstName,  value: user.first_name },
    { label: t.lastName,   value: user.last_name  },
  ];

  return (
    <section
      className={`rounded-2xl border p-5 ${
        isDark ? "bg-surface border-border" : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      {/* Header: title + actions */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? "text-primary/70" : "text-secondary/70"}`}>
          {t.title}
        </p>
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

      {/* Fields grid */}
      <div className={`border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 ${isDark ? "border-border/60" : "border-gray-100"}`}>
        {fields.map(({ label, value }) => (
          <div key={label}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isDark ? "text-white/60" : "text-gray-400"}`}>
              {label}
            </p>
            <p className={`text-sm break-all font-medium ${isDark ? "text-white" : "text-dark"}`}>
              {value || "—"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
