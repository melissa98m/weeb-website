import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false); // drawer mobile

  // Accès: tout utilisateur connecté peut voir le layout.
  // Les pages internes restent libres d'ajouter leurs propres gardes si besoin.
  if (!user) return <div className="p-6">Veuillez vous connecter.</div>;

  const bg = theme === "dark" ? "bg-background text-white" : "bg-light text-dark";
  const topPadding = "pt-[34px] md:pt-[58px]"; // marge pour ne pas passer sous le Header global

  return (
    <div className={`relative ${bg} ${topPadding}`}>
      <div className="mx-auto px-3 md:px-4 py-5">
        {/* Bouton burger mobile */}
        <div className="md:hidden mb-3">
          <button
            onClick={() => setOpen(true)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              theme === "dark"
                ? "bg-[#1c1c1c] border-[#333] text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
            aria-label="Ouvrir le menu d’administration"
          >
            ☰ Menu
          </button>
        </div>

        <div className="md:grid md:grid-cols-[260px_1fr] md:gap-5">
          <AdminSidebar open={open} onClose={() => setOpen(false)} />
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
