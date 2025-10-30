import React from "react";
import { useTheme } from "../../context/ThemeContext";

export default function PageSizer({ pageSize, onChange, className = "" }) {
  const { theme } = useTheme();

  const labelThemed = theme === "dark" ? "text-white/90" : "text-gray-800";
  const selectBase =
    "rounded-xl border px-3 py-2 outline-none transition";
  const selectThemed =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] focus:ring-2 focus:ring-white/20 focus:border-white/30"
      : "bg-white text-gray-900 border-gray-200 focus:ring-2 focus:ring-black/10 focus:border-gray-300";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className={`text-sm font-medium ${labelThemed}`} htmlFor="page-size">
        Afficher
      </label>
      <select
        id="page-size"
        className={`${selectBase} ${selectThemed}`}
        value={pageSize}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {[10, 20, 50, 100].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span className={`text-sm ${labelThemed}`}>par page</span>
    </div>
  );
}
