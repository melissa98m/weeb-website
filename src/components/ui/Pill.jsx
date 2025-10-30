// src/components/ui/Pill.jsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Props:
 * - color: "neutral" | "primary" | "success" | "warning" | "danger" | "info"
 * - variant: "soft" | "solid" | "outline"
 * - size: "sm" | "md"
 * - className: string
 */
function Pill({
  children,
  color = "neutral",
  variant = "soft",
  size = "sm",
  className = "",
}) {
  const { theme } = useTheme();

  const base = "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap";

  const sizes = {
    sm: "text-xs px-2.5 py-0.5",
    md: "text-sm px-3 py-1",
  };

  // palettes par thème
  const paletteLight = {
    neutral: {
      soft: "bg-gray-100 text-gray-800 border border-gray-200",
      solid: "bg-gray-800 text-white",
      outline: "bg-transparent text-gray-800 border border-gray-300",
    },
    primary: {
      soft: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      solid: "bg-indigo-600 text-white",
      outline: "bg-transparent text-indigo-700 border border-indigo-300",
    },
    success: {
      soft: "bg-green-50 text-green-700 border border-green-200",
      solid: "bg-green-600 text-white",
      outline: "bg-transparent text-green-700 border border-green-300",
    },
    warning: {
      soft: "bg-amber-50 text-amber-800 border border-amber-200",
      solid: "bg-amber-600 text-white",
      outline: "bg-transparent text-amber-800 border border-amber-300",
    },
    danger: {
      soft: "bg-red-50 text-red-700 border border-red-200",
      solid: "bg-red-600 text-white",
      outline: "bg-transparent text-red-700 border border-red-300",
    },
    info: {
      soft: "bg-sky-50 text-sky-700 border border-sky-200",
      solid: "bg-sky-600 text-white",
      outline: "bg-transparent text-sky-700 border border-sky-300",
    },
  };

  const paletteDark = {
    neutral: {
      soft: "bg-[#1f1f1f] text-white border border-[#333]",
      solid: "bg-white/10 text-white",
      outline: "bg-transparent text-white border border-[#444]",
    },
    primary: {
      soft: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
      solid: "bg-indigo-600 text-white",
      outline: "bg-transparent text-indigo-300 border border-indigo-500/40",
    },
    success: {
      soft: "bg-green-500/20 text-green-300 border border-green-500/30",
      solid: "bg-green-600 text-white",
      outline: "bg-transparent text-green-300 border border-green-500/40",
    },
    warning: {
      soft: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
      solid: "bg-amber-600 text-white",
      outline: "bg-transparent text-amber-300 border border-amber-500/40",
    },
    danger: {
      soft: "bg-red-500/20 text-red-300 border border-red-500/30",
      solid: "bg-red-600 text-white",
      outline: "bg-transparent text-red-300 border border-red-500/40",
    },
    info: {
      soft: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
      solid: "bg-sky-600 text-white",
      outline: "bg-transparent text-sky-300 border border-sky-500/40",
    },
  };

  const palettes = theme === "dark" ? paletteDark : paletteLight;
  const tone = palettes[color]?.[variant] ?? palettes.neutral.soft;

  return (
    <span className={`${base} ${sizes[size]} ${tone} ${className}`}>
      {children}
    </span>
  );
}

export default React.memo(Pill);
