import React from "react";
import TrainingItem from "./TrainingItem";

export default function TrainingsList({
  formations,
  fbMap,
  loading,
  error,
  theme,
  t,
  onGiveFeedback,
}) {
  const isDark = theme === "dark";

  return (
    <section id="formations" className="mt-6">
      {/* Section label */}
      <p
        className={`text-[11px] uppercase tracking-[.15em] font-semibold mb-1.5 ${
          isDark ? "text-primary/70" : "text-secondary/70"
        }`}
      >
        {t.trainings}
      </p>
      <h2
        className={`font-display font-bold text-xl mb-4 ${
          isDark ? "text-white" : "text-dark"
        }`}
      >
        {t.trainings}
      </h2>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xl border p-5 animate-pulse ${
                isDark ? "bg-surface border-border" : "bg-white border-gray-200"
              }`}
            >
              <div className="h-4 w-2/3 bg-gray-300/30 rounded mb-3" />
              <div className="h-2 w-full bg-gray-300/20 rounded mb-1" />
              <div className="h-3 w-1/4 bg-gray-300/20 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className={`rounded-xl border p-5 text-sm ${
            isDark ? "bg-surface border-border text-white/60" : "bg-white border-gray-200 text-dark/60"
          }`}
        >
          {t.trainings_error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && formations.length === 0 && (
        <div
          className={`rounded-xl border p-8 text-center ${
            isDark ? "bg-surface border-border" : "bg-white border-gray-200"
          }`}
        >
          <p className={`text-sm ${isDark ? "text-white/50" : "text-dark/50"}`}>
            {t.trainings_empty}
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && formations.length > 0 && (
        <div className="space-y-4">
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
