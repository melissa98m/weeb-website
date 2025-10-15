import React from "react";
import { Link } from "react-router-dom";

/**
 * Button générique réutilisable sur tout le site
 * Props:
 * - to: chemin à passer à Link (optionnel)
 * - onClick: fonction à exécuter au clic (optionnel)
 * - className: classes Tailwind supplémentaires
 * - children: contenu du bouton
 */
export default function Button({
  to,
  children,
  className = "",
  type,           
  onClick,
  ...rest
}) {
  const baseClasses = 'transition-transform transition-colors duration-200 ease-in-out transform hover:scale-110 focus:outline-none';
  const combinedClasses = `${baseClasses} ${className}`.trim();

  if (to) {
    // Lien de navigation (pas de <button> imbriqué)
    return (
      <Link to={to} className={`${baseClasses} ${className}`} {...rest}>
        {children}
      </Link>
    );
  }

  // Bouton natif
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      className={combinedClasses}>
      {children}
    </button>
  );
}
