import React, { memo } from "react";
import Button from "../../components/Button";
import { useLanguage } from "../../context/LanguageContext";

function FormationCardBase({ f, theme, onView }) {
  const { language } = useLanguage();
  const title = f?.name || "";
  const excerpt = f?.description || "";
  const isDark = theme === "dark";

  return (
    <article
      className={[
        "group relative flex flex-col rounded-xl border transition-all duration-200 overflow-hidden",
        "focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-1",
        isDark
          ? "bg-surface border-border hover:border-primary/30 text-white focus-within:ring-offset-surface"
          : "bg-white border-gray-200 hover:border-primary/30 text-gray-900 focus-within:ring-offset-white",
      ].join(" ")}
    >
      {/* Thin accent line */}
      <div className="h-px w-full bg-primary" />

      {/* Body */}
      <div className="flex-1 p-5">
        {/* Category badge — neutral, no violet */}
        <div className="mb-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-mono ${
            isDark
              ? "bg-surface-2 text-muted border border-border"
              : "bg-gray-100 text-gray-500 border border-gray-200"
          }`}>
            {language === "fr" ? "Formation" : "Course"}
          </span>
        </div>

        <h2
          className={[
            "text-base md:text-lg font-bold tracking-tight leading-snug mb-2 line-clamp-2",
            "transition-colors duration-200",
            isDark
              ? "text-white group-hover:text-primary"
              : "text-gray-900 group-hover:text-secondary",
          ].join(" ")}
        >
          {title}
        </h2>

        {excerpt ? (
          <p className={`text-sm leading-relaxed line-clamp-3 ${
            isDark ? "text-white/55" : "text-gray-500"
          }`}>
            {excerpt}
          </p>
        ) : (
          <p className={`text-sm italic ${isDark ? "text-white/30" : "text-gray-400"}`}>—</p>
        )}

        {/* Progress bar */}
        {typeof f.progress_percent === "number" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={isDark ? "text-white/40" : "text-gray-400"}>
                {language === "fr" ? "Progression" : "Progress"}
              </span>
              <span className={`font-semibold tabular-nums ${
                f.progress_percent === 100 ? "text-emerald-500" : isDark ? "text-white/70" : "text-dark/70"
              }`}>
                {f.progress_percent}%
              </span>
            </div>
            <div className={`h-1 rounded-full overflow-hidden ${isDark ? "bg-white/8" : "bg-gray-100"}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  f.progress_percent === 100 ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${f.progress_percent}%` }}
                role="progressbar"
                aria-valuenow={f.progress_percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${language === "fr" ? "Progression" : "Progress"} : ${f.progress_percent}%`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`px-5 py-3 border-t ${isDark ? "border-border" : "border-gray-100"}`}>
        <Button
          type="button"
          variant="ghost"
          size="md"
          isDark={isDark}
          onClick={() => onView?.(f)}
          className="w-full justify-center"
          aria-label={`${language === "fr" ? "Voir les détails de" : "View details for"} ${title}`}
        >
          {language === "fr" ? "Voir les détails" : "View details"}
        </Button>
      </div>
    </article>
  );
}

export default memo(FormationCardBase);
