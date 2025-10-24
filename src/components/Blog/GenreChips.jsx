import React from "react";

function textColorFor(bgHex) {
  if (!bgHex || !/^#[0-9A-Fa-f]{6}$/.test(bgHex)) return "#111827";
  const r = parseInt(bgHex.slice(1, 3), 16);
  const g = parseInt(bgHex.slice(3, 5), 16);
  const b = parseInt(bgHex.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 140 ? "#111827" : "#ffffff";
}

export default function GenreChips({ genres, selectedId, onChange, theme }) {
  return (
    <div className="flex flex-wrap gap-2">
      {genres.map((g) => {
        const active = selectedId === g.id;
        const style = active && g.color
          ? { backgroundColor: g.color, color: textColorFor(g.color), borderColor: g.color }
          : {
              backgroundColor: "transparent",
              color: g.color || (theme === "dark" ? "#ffffff" : "#111827"),
              borderColor: g.color || (theme === "dark" ? "#333333" : "#e5e7eb"),
            };
        return (
          <button
            key={g.id ?? "all"}
            onClick={() => onChange(active ? null : g.id)}
            className="px-3 py-1.5 text-sm rounded-full border transition hover:scale-105"
            style={style}
          >
            {g.name}
          </button>
        );
      })}
    </div>
  );
}
