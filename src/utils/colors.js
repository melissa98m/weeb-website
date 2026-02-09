function isValidHex(hex) {
  return typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex);
}

export function hexToRgba(hex, alpha) {
  if (!isValidHex(hex)) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function safeChipStyle(color, theme) {
  const isDark = theme === "dark";
  const baseText = isDark ? "#f9fafb" : "#111827";
  const fallbackBorder = isDark ? "#333333" : "#e5e7eb";

  if (!isValidHex(color)) {
    return {
      backgroundColor: "transparent",
      borderColor: fallbackBorder,
      color: baseText,
    };
  }

  return {
    backgroundColor: hexToRgba(color, isDark ? 0.2 : 0.12),
    borderColor: color,
    color: baseText,
  };
}
