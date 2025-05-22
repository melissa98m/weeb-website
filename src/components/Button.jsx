import { Link } from 'react-router-dom';

/**
 * Button générique réutilisable sur tout le site
 * Props:
 * - to: chemin à passer à Link (optionnel)
 * - onClick: fonction à exécuter au clic (optionnel)
 * - className: classes Tailwind supplémentaires
 * - children: contenu du bouton
 */
export default function Button({ to, onClick, className = '', children, ...props }) {
  const btn = (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  );
  return to ? <Link to={to}>{btn}</Link> : btn;
}
