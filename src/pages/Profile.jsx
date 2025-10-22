// src/pages/Profile.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import FeedbackModal from "../components/FeedbackModal";

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
            feedback: "Donner un feedback",
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
            feedback: "Give feedback",
          },
    [language]
  );

  if (!user) return null;

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  // ---------- Formations ----------
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
          { credentials: "include", signal: ctr.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
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

  // ---------- Modale feedback ----------
  const userId = user?.id ?? user?.pk ?? user?.user_id ?? null;
  const [openFb, setOpenFb] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);

  const openFeedback = (formation) => {
    setSelectedFormation(formation);
    setOpenFb(true);
  };
  const closeFeedback = () => {
    setOpenFb(false);
    setSelectedFormation(null);
  };

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

        {/* -------- Formations de l'utilisateur -------- */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">{t.trainings}</h2>

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

          {!fLoading && !fError && formations.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {formations.map((f) => (
                <div
                  key={f.id}
                  className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                    theme === "dark"
                      ? "bg-[#1c1c1c] border-[#333]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div>
                    <div className="text-base font-medium">{f.name || "—"}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => openFeedback(f)}
                      className={`px-3 py-1.5 rounded-md shadow text-sm hover:brightness-110 ${
                        theme === "dark"
                          ? "bg-secondary text-white"
                          : "bg-primary text-dark"
                      }`}
                    >
                      {t.feedback}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modale Feedback */}
      <FeedbackModal
        open={openFb}
        onClose={closeFeedback}
        userId={userId}
        formation={selectedFormation}
        theme={theme}
        language={language}
      />
    </main>
  );
}
