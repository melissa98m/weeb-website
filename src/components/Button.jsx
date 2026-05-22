import React, { forwardRef } from "react";
import { Link } from "react-router-dom";

const SIZES = {
  sm: "text-xs px-3 py-1.5 min-h-[32px]",
  md: "text-sm px-4 py-2 min-h-[40px]",
  lg: "text-sm px-6 py-2.5 min-h-[44px]",
};

function buildVariantClasses(variant, size, isDark) {
  const sizeClass = SIZES[size] ?? SIZES.md;

  if (variant === "primary") {
    return `${sizeClass} bg-secondary text-white hover:bg-secondary/90 active:bg-secondary/80 rounded-md shadow-sm`;
  }
  if (variant === "ghost") {
    return isDark
      ? `${sizeClass} border border-border-2 text-white/80 hover:text-white hover:border-white/30 hover:bg-white/5 rounded-md`
      : `${sizeClass} border border-dark/20 text-dark/80 hover:text-dark hover:border-dark/40 hover:bg-dark/5 rounded-md`;
  }
  if (variant === "text") {
    return isDark
      ? "text-sm text-white/60 hover:text-white min-h-[44px] flex items-center"
      : "text-sm text-dark/60 hover:text-dark min-h-[44px] flex items-center";
  }
  return "";
}

/**
 * Button générique
 * - Si `to` est fourni => <Link>
 * - Sinon => <button>
 * - `variant`: "primary" | "ghost" | "text" — active le design system
 * - `size`: "sm" | "md" | "lg" (default "md")
 * - `isDark`: bool (default true) — requis pour ghost/text, ignoré pour primary
 */
const Button = forwardRef(function Button(
  {
    to,
    children,
    className = "",
    variant,
    size = "md",
    isDark = true,
    type,
    onClick,
    disabled = false,
    ...rest
  },
  ref
) {
  const variantClasses = variant ? buildVariantClasses(variant, size, isDark) : "";

  const base =
    "transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500";

  const combined = [base, variantClasses, className].filter(Boolean).join(" ");

  const arrow =
    variant === "text" ? (
      <span aria-hidden="true" className="ml-1.5 transition-transform duration-150 group-hover:translate-x-0.5">
        →
      </span>
    ) : null;

  if (to) {
    return (
      <Link
        to={to}
        className={`group ${combined}`}
        aria-disabled={disabled || undefined}
        onClick={(e) => {
          if (disabled) e.preventDefault();
          if (onClick) onClick(e);
        }}
        {...rest}
      >
        {children}
        {arrow}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      onClick={onClick}
      className={`group ${combined}`}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
      {arrow}
    </button>
  );
});

export default Button;
