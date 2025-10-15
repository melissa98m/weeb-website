// src/pages/Profile.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export default function Profile() {
  const { user, reload, logout } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const t = language === "fr"
    ? {
        title: "Mon profil",
        username: "Nom d'utilisateur",
        email: "Email",
        firstName: "Prénom",
        lastName: "Nom",
        refresh: "Rafraîchir",
        signout: "Se déconnecter",
      }
    : {
        title: "My profile",
        username: "Username",
        email: "Email",
        firstName: "First name",
        lastName: "Last name",
        refresh: "Refresh",
        signout: "Sign out",
      };

  if (!user) return null; // déjà filtré par ProtectedRoute

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  return (
    <main className={`min-h-[60vh] px-6 py-16 flex justify-center`}>
      <section className={`w-full max-w-2xl rounded-xl border shadow ${card} p-6`}>
        <h1 className="text-2xl font-semibold mb-6">{t.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-70">{t.username}</div>
            <div className="text-base font-medium break-all">{user.username}</div>
          </div>

          <div>
            <div className="text-sm opacity-70">{t.email}</div>
            <div className="text-base font-medium break-all">{user.email}</div>
          </div>

          <div>
            <div className="text-sm opacity-70">{t.firstName}</div>
            <div className="text-base font-medium">{user.first_name || "—"}</div>
          </div>

          <div>
            <div className="text-sm opacity-70">{t.lastName}</div>
            <div className="text-base font-medium">{user.last_name || "—"}</div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={reload}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:opacity-90"
          >
            {t.refresh}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:opacity-90"
          >
            {t.signout}
          </button>
        </div>
      </section>
    </main>
  );
}
