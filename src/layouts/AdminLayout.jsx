import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/admin/AdminSidebar";

function IconMenu({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const isDark = theme === "dark";

  if (!user) return <div className="p-6">Veuillez vous connecter.</div>;

  const bg = isDark ? "bg-background text-white" : "bg-light text-dark";
  const topPadding = "pt-[34px] md:pt-[58px]";

  return (
    <div className={`relative ${bg} ${topPadding} min-h-screen`}>
      {/* Mobile top bar */}
      <div className="md:hidden px-4 pt-3 pb-2">
        <button
          onClick={() => setOpen(true)}
          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
            isDark
              ? "bg-surface border-border text-white/80 hover:text-white hover:bg-surface-2"
              : "bg-white border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          }`}
          aria-label="Ouvrir le menu d'administration"
        >
          <IconMenu />
          <span>Menu</span>
        </button>
      </div>

      <div className="md:grid md:grid-cols-[260px_1fr] py-4 px-3 md:py-5 md:pl-4 md:pr-0">
        <AdminSidebar open={open} onClose={() => setOpen(false)} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
