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
    <div className={`relative ${bg} ${topPadding} min-h-screen`}>
      {/* Bouton burger mobile */}
      <div className="md:hidden px-3 pt-4 pb-2">
        <button
          onClick={() => setOpen(true)}
          className={`rounded-xl border px-3 py-2 text-sm ${
            theme === "dark"
              ? "bg-surface border-border text-white"
              : "bg-white border-gray-200 text-gray-900"
          }`}
          aria-label="Ouvrir le menu d'administration"
        >
          ☰ Menu
        </button>
      </div>

      {/* Layout principal : sidebar fixe + contenu qui prend tout l'espace restant */}
      <div className="md:grid md:grid-cols-[260px_1fr] py-4 px-3 md:py-5 md:pl-4 md:pr-0">
        <AdminSidebar open={open} onClose={() => setOpen(false)} />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
