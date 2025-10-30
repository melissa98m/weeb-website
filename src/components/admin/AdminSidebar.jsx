import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

/* ==== Icônes inline (SVG) sans dépendance ==== */
function IconBase({ children, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function IconLink() {
  return (
    <IconBase>
      {/* maillon gauche */}
      <path d="M8 7h2a4 4 0 0 1 0 8H8" />
      {/* maillon droit */}
      <path d="M16 17h-2a4 4 0 0 1 0-8h2" />
      {/* jonction */}
      <path d="M9 12h6" />
    </IconBase>
  );
}

function IconCap() {
  return (
    <IconBase>
      <path d="M12 4l9 5-9 5-9-5 9-5z" />
      <path d="M4 10v4l8 4 8-4v-4" />
    </IconBase>
  );
}

function IconMessage() {
  return (
    <IconBase>
      <rect x="3" y="4" width="18" height="14" rx="3" />
      <path d="M3 9l9 4 9-4" />
    </IconBase>
  );
}

function IconInbox() {
  return (
    <IconBase>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M3 13h5l2 3h4l2-3h5" />
    </IconBase>
  );
}

/* ===== Items de navigation ===== */
const navItems = [
  { label: "Affectations", to: "/admin/user-formations", icon: IconLink },
  { label: "Formations", to: "/admin/formations", icon: IconCap },
  { label: "Feedbacks", to: "/admin/feedbacks", icon: IconMessage },
  { label: "Messages", to: "/admin/messages", icon: IconInbox },
];

export default function AdminSidebar({ open = false, onClose = () => {} }) {
  const { theme } = useTheme();

  const panel =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const itemBase =
    "flex items-center gap-2 px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-1";
  const itemLight = "hover:bg-gray-100 focus:ring-gray-400";
  const itemDark = "hover:bg-[#262626] focus:ring-[#444]";
  const activeLight = "bg-gray-100 font-medium";
  const activeDark = "bg-[#262626] font-medium";

  return (
    <>
      {/* Backdrop mobile */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          open ? "bg-black/40 opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed z-50 md:z-auto md:static top-0 md:top-auto h-full md:h-auto w-72 md:w-64 border md:rounded-2xl md:sticky md:self-start md:top-24
          transition-transform md:transition-none ${panel}
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        role="navigation"
        aria-label="Menu d’administration"
      >
        {/* Entête mobile */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b">
          <div className="font-semibold">Administration</div>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg border"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <div className="p-3 md:p-4">
          <ul className="space-y-1">
            {navItems.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `${itemBase} ${theme === "dark" ? itemDark : itemLight} ${
                      isActive ? (theme === "dark" ? activeDark : activeLight) : ""
                    }`
                  }
                  onClick={onClose}
                >
                  <Icon />
                  <span className="truncate">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
