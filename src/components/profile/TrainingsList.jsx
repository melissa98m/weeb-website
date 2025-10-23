import React from "react";
import TrainingItem from "./TrainingItem";

export default function TrainingsList({
  formations,
  fbMap,
  loading,
  error,
  theme,
  t,
  onGiveFeedback
}) {
  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  return (
    <section className="w-full max-w-2xl mt-10">
      <h2 className="text-xl font-semibold mb-4">{t.trainings}</h2>

      {(loading) && (
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

      {!loading && error && (
        <div className={`rounded-lg border p-4 text-sm ${card}`}>
          {t.trainings_error}
        </div>
      )}

      {!loading && !error && formations.length === 0 && (
        <div className={`rounded-lg border p-4 text-sm ${card}`}>
          {t.trainings_empty}
        </div>
      )}

      {!loading && !error && formations.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {formations.map((f) => (
            <TrainingItem
              key={f.id}
              formation={f}
              existingFeedback={fbMap[f.id]}
              theme={theme}
              t={t}
              onGiveFeedback={onGiveFeedback}
            />
          ))}
        </div>
      )}
    </section>
  );
}
