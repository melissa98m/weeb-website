import React from "react";

function textColorFor(bgHex) {
  if (!bgHex || !/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "#111827";
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#111827" : "#ffffff";
}

function hexToRgba(hex, alpha) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function GenreChips({ genres, selectedId, onChange, theme }) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((g) => {
        const active = selectedId === g.id;
        const isDark = theme === "dark";
        const inactiveText = isDark ? "#f9fafb" : "#111827";
        const style = active && g.color
          ? { backgroundColor: g.color, color: textColorFor(g.color), borderColor: g.color }
          : {
              backgroundColor: g.color
                ? hexToRgba(g.color, isDark ? 0.22 : 0.12)
                : isDark
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              color: inactiveText,
              borderColor: g.color
                ? hexToRgba(g.color, isDark ? 0.7 : 0.5)
                : isDark
                  ? "#4b5563"
                  : "#e5e7eb",
            };
        return (
          <button
            key={g.id ?? "all"}
            onClick={() => onChange(active ? null : g.id)}
            className="px-3 py-1.5 text-sm rounded-full border transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1"
            style={style}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
}
