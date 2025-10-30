import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { hasPersonnelRole } from "../utils/roles";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false); // drawer mobile

  // garde… par sécurité ( déjà <PersonnelRoute /> côté routes)
  if (!user) return <div className="p-6">Veuillez vous connecter.</div>;
  if (!hasPersonnelRole(user))
    return <div className="p-6 text-red-600">Accès refusé. Cette zone est réservée au personnel.</div>;

  const bg = theme === "dark" ? "bg-background text-white" : "bg-light text-dark";
  const topPadding = "pt-[64px] md:pt-[128px]"; // pour ne pas passer sous le Header global

  return (
    <div className={`relative ${bg} ${topPadding}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Bouton burger mobile */}
        <div className="md:hidden mb-3">
          <button
            onClick={() => setOpen(true)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              theme === "dark" ? "bg-[#1c1c1c] border-[#333] text-white" : "bg-white border-gray-200 text-gray-900"
            }`}
            aria-label="Ouvrir le menu d’administration"
          >
            ☰ Menu
          </button>
        </div>

        <div className="md:grid md:grid-cols-[260px_1fr] md:gap-6">
          <AdminSidebar open={open} onClose={() => setOpen(false)} />

          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
