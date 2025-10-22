import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function Profile() {
  const { user, reload, logout } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();

  const t = useMemo(
    () =>
      language === "fr"
        ? {
            title: "Mon profil",
            username: "Nom d'utilisateur",
            email: "Email",
            firstName: "Prénom",
            lastName: "Nom",
            refresh: "Rafraîchir",
            signout: "Se déconnecter",
            trainings: "Mes formations",
            trainings_empty: "Aucune formation suivie.",
            trainings_error: "Impossible de charger vos formations.",
            trainings_loading: "Chargement…",
          }
        : {
            title: "My profile",
            username: "Username",
            email: "Email",
            firstName: "First name",
            lastName: "Last name",
            refresh: "Refresh",
            signout: "Sign out",
            trainings: "My trainings",
            trainings_empty: "No trainings yet.",
            trainings_error: "Unable to load your trainings.",
            trainings_loading: "Loading…",
          },
    [language]
  );

  if (!user) return null; // déjà filtré par ProtectedRoute

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  // ---------- Bloc formations (API: /api/formations?user={id}) ----------
  const [formations, setFormations] = useState([]);
  const [fLoading, setFLoading] = useState(true);
  const [fError, setFError] = useState(null);

  useEffect(() => {
    const userId = user?.id ?? user?.pk ?? user?.user_id;
    if (!userId) {
      setFormations([]);
      setFLoading(false);
      return;
    }
    const ctr = new AbortController();
    (async () => {
      try {
        setFLoading(true);
        setFError(null);
        const res = await fetch(
          `${API_BASE}/formations/?user=${encodeURIComponent(userId)}`,
          {
            // Si ton endpoint nécessite les cookies JWT, garde "include"
            credentials: "include",
            signal: ctr.signal,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        // On attend {id, name} (description optionnelle, ignorée ici)
        setFormations(list);
      } catch (e) {
        setFError(e);
        setFormations([]);
      } finally {
        setFLoading(false);
      }
    })();
    return () => ctr.abort();
  }, [user]);

  return (
    <main className={`min-h-[60vh] px-6 py-16 flex justify-center`}>
      <section className={`w-full max-w-2xl rounded-xl border shadow ${card} p-6`}>
        <h1 className="text-2xl font-semibold mb-6">{t.title}</h1>

        {/* Infos utilisateur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-70">{t.username}</div>
            <div className="text-base font-medium break-all">
              {user.username || "—"}
            </div>
          </div>

          <div>
            <div className="text-sm opacity-70">{t.email}</div>
            <div className="text-base font-medium break-all">
              {user.email || "—"}
            </div>
          </div>

          <div>
            <div className="text-sm opacity-70">{t.firstName}</div>
            <div className="text-base font-medium">
              {user.first_name || "—"}
            </div>
          </div>

          <div>
            <div className="text-sm opacity-70">{t.lastName}</div>
            <div className="text-base font-medium">
              {user.last_name || "—"}
            </div>
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

        {/* -------- Bloc: formations de l'utilisateur -------- */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">{t.trainings}</h2>

          {/* Loading */}
          {fLoading && (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-4 animate-pulse ${
                    theme === "dark"
                      ? "bg-[#1c1c1c] border-[#333]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="h-4 w-2/3 bg-gray-300/30 rounded mb-2" />
                  <div className="h-3 w-1/3 bg-gray-300/30 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!fLoading && fError && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                theme === "dark"
                  ? "bg-[#1c1c1c] border-[#333] text-red-300"
                  : "bg-white border-gray-200 text-red-700"
              }`}
            >
              {t.trainings_error}
            </div>
          )}

          {/* Empty */}
          {!fLoading && !fError && formations.length === 0 && (
            <div
              className={`rounded-lg border p-4 text-sm ${
                theme === "dark"
                  ? "bg-[#1c1c1c] border-[#333] text-white/70"
                  : "bg-white border-gray-200 text-gray-600"
              }`}
            >
              {t.trainings_empty}
            </div>
          )}

          {/* List */}
          {!fLoading && !fError && formations.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {formations.map((f) => (
                <div
                  key={f.id}
                  className={`rounded-lg border p-4 ${
                    theme === "dark"
                      ? "bg-[#1c1c1c] border-[#333]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="text-base font-medium">
                    {f.name || "—"}
                  </div>
                  {/* Si tu ajoutes 'description' plus tard côté API, tu peux décommenter: */}
                  {/* <div className={`text-sm ${theme === "dark" ? "text-white/70" : "text-gray-600"}`}>
                    {f.description || "—"}
                  </div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
