import React from "react";
import { useTheme } from "../../context/ThemeContext";

function Select({ value, onChange, options = [], placeholder, id, className = "", disabled = false }) {
  const { theme } = useTheme();

  const base =
    "w-full rounded-xl border px-3 py-2 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed";
  const themed =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333] placeholder:text-white/50 focus:ring-2 focus:ring-white/20 focus:border-white/30"
      : "bg-white text-gray-900 border-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 focus:border-gray-300";

  return (
    <select
      id={id}
      className={`${base} ${themed} ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
    >
      <option value="">{placeholder ?? "—"}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default React.memo(Select);