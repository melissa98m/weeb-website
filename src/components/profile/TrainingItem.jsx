import React from "react";

export default function TrainingItem({
  formation,
  existingFeedback,
  theme,
  t,
  onGiveFeedback
}) {
  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] border-[#333]"
      : "bg-white border-gray-200";

  const progress = formation.progress_percent ?? null;

  return (
    <div className={`rounded-lg border p-4 ${card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-base font-medium">{formation.name || "—"}</div>
          {progress !== null && (
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1 opacity-70">
                <span>Progression</span>
                <span className={progress === 100 ? "text-green-500 font-medium" : ""}>{progress}%</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-green-500" : "bg-indigo-500"}`}
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </div>
          )}
        </div>

        {!existingFeedback ? (
          <button
            onClick={() => onGiveFeedback(formation)}
            className={`px-3 py-1.5 rounded-md shadow text-sm hover:brightness-110 ${
              theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
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

      {existingFeedback && (
        <div
          className={`mt-3 rounded-md border p-3 text-sm ${
            theme === "dark" ? "border-[#333] bg-[#1f1f1f]" : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="font-medium mb-1">{t.your_feedback}</div>
          <p className={theme === "dark" ? "text-white/80" : "text-gray-700"}>
            {existingFeedback.feedback_content || "—"}
          </p>
        </div>
      )}
    </div>
  );
}
