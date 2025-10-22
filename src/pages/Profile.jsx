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
            already_sent: "Feedback déjà envoyé",
            your_feedback: "Votre feedback",
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
            already_sent: "Feedback already sent",
            your_feedback: "Your feedback",
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

  // ---------- Feedbacks existants de l'utilisateur ----------
  const userId = user?.id ?? user?.pk ?? user?.user_id ?? null;
  const [fbMap, setFbMap] = useState({}); // { [formationId]: feedbackObj }
  const [fbLoading, setFbLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setFbMap({});
      setFbLoading(false);
      return;
    }
    const ctr = new AbortController();
    (async () => {
      try {
        setFbLoading(true);
        const res = await fetch(`${API_BASE}/feedbacks/?user=${userId}`, {
          credentials: "include",
          signal: ctr.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        const map = {};
        for (const item of list) {
          // formation peut être un id ou un objet
          const fid = typeof item.formation === "object" ? item.formation.id : item.formation;
          if (fid != null) map[fid] = item;
        }
        setFbMap(map);
      } catch {
        setFbMap({});
      } finally {
        setFbLoading(false);
      }
    })();
    return () => ctr.abort();
  }, [userId]);

  // ---------- Modale feedback ----------
  const [openFb, setOpenFb] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);

  const openFeedback = (formation) => {
    // Si feedback déjà existant → on n’ouvre pas la modale d’édition
    const existing = fbMap[formation.id];
    if (existing) return; // on bloque
    setSelectedFormation(formation);
    setOpenFb(true);
  };
  const closeFeedback = () => {
    setOpenFb(false);
    setSelectedFormation(null);
  };

  // Quand on crée un nouveau feedback, on met à jour fbMap pour bloquer la suite
  const handleFeedbackCreated = (created) => {
    const fid =
      typeof created?.formation === "object"
        ? created.formation?.id
        : created?.formation ?? selectedFormation?.id;
    if (!fid) return;
    setFbMap((m) => ({ ...m, [fid]: created || { formation: fid, feedback_content: "" } }));
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
        </div>

        {/* -------- Formations de l'utilisateur -------- */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">{t.trainings}</h2>

          {/* States */}
          {(fLoading || fbLoading) && (
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

          {!fLoading && !fbLoading && fError && (
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

          {!fLoading && !fbLoading && !fError && formations.length === 0 && (
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

          {!fLoading && !fbLoading && !fError && formations.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {formations.map((f) => {
                const existing = fbMap[f.id];
                return (
                  <div
                    key={f.id}
                    className={`rounded-lg border p-4 ${
                      theme === "dark"
                        ? "bg-[#1c1c1c] border-[#333]"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-base font-medium">{f.name || "—"}</div>
                      </div>

                      {/* Bouton: caché/désactivé si déjà envoyé */}
                      {!existing ? (
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
                      ) : (
                        <span className="text-xs px-2 py-1 rounded border border-green-500 text-green-600">
                          ✓ {t.already_sent}
                        </span>
                      )}
                    </div>

                    {/* Feedback existant en lecture seule */}
                    {existing && (
                      <div
                        className={`mt-3 rounded-md border p-3 text-sm ${
                          theme === "dark"
                            ? "border-[#333] bg-[#1f1f1f]"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="font-medium mb-1">{t.your_feedback}</div>
                        <p className={theme === "dark" ? "text-white/80" : "text-gray-700"}>
                          {existing.feedback_content || "—"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modale Feedback — uniquement si pas encore envoyé */}
      <FeedbackModal
        open={openFb}
        onClose={closeFeedback}
        userId={userId}
        formation={selectedFormation}
        theme={theme}
        language={language}
        onSuccess={handleFeedbackCreated}
      />
    </main>
  );
}