import React, { forwardRef } from "react";
import { Link } from "react-router-dom";

/**
 * Button générique
 * - Si `to` est fourni => <Link>
 * - Sinon => <button>
 * - Par défaut, type="submit" dans un formulaire (sauf si onClick est fourni)
 */
const Button = forwardRef(function Button(
  {
    to,
    children,
    className = "",
    type,
    onClick,
    disabled = false,
    ...rest
  },
  ref
) {
  const baseClasses =
    "transition-transform transition-colors duration-200 ease-in-out transform hover:scale-110 focus:outline-none";
  const combinedClasses = `${baseClasses} ${className}`.trim();

  if (to) {
    // Lien de navigation
    return (
      <Link
        to={to}
        className={combinedClasses}
        aria-disabled={disabled || undefined}
        onClick={(e) => {
          if (disabled) e.preventDefault();
          if (onClick) onClick(e);
        }}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  // Heuristique : si aucun type n'est fourni, on met "submit" par défaut,
  // sauf si onClick est présent (cas bouton d'action hors submit).
  const computedType = type ?? (onClick ? "button" : "submit");

  return (
    <button
      ref={ref}
      type={computedType}
      onClick={onClick}
      className={combinedClasses}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
