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
        "focus-within:ring-2 focus-within:ring-violet-500/60 focus-within:ring-offset-1",
        isDark
          ? "bg-surface border-surface-3 hover:border-purple-500/40 text-white focus-within:ring-offset-surface"
          : "bg-white border-gray-200 hover:border-purple-500/40 text-gray-900 focus-within:ring-offset-white",
      ].join(" ")}
    >
      {/* Colored accent bar at the top */}
      <div className={`h-1 w-full ${
        isDark
          ? "bg-gradient-to-r from-primary via-secondary to-primary/30"
          : "bg-gradient-to-r from-secondary via-primary to-secondary/30"
      }`} />

      {/* Corps */}
      <div className="flex-1 p-5">
        {/* Category badge */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            isDark
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-secondary/10 text-secondary border border-secondary/20"
          }`}>
            <span aria-hidden="true">✦</span>
            {language === "fr" ? "Formation" : "Course"}
          </span>
        </div>

        <h2
          className={[
            "text-base md:text-lg font-bold tracking-tight leading-snug mb-2 line-clamp-2",
            "transition-colors duration-200",
            isDark
              ? "text-white group-hover:text-purple-400"
              : "text-gray-900 group-hover:text-purple-400",
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
          <p className={`text-sm italic ${
            isDark ? "text-white/30" : "text-gray-400"
          }`}>
            —
          </p>
        )}

        {/* Barre de progression */}
        {typeof f.progress_percent === "number" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className={isDark ? "text-white/40" : "text-gray-400"}>
                {language === "fr" ? "Progression" : "Progress"}
              </span>
              <span className={`font-semibold tabular-nums ${
                f.progress_percent === 100
                  ? "text-emerald-500"
                  : isDark ? "text-primary" : "text-secondary"
              }`}>
                {f.progress_percent}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${
              isDark ? "bg-white/8" : "bg-gray-100"
            }`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  f.progress_percent === 100
                    ? "bg-emerald-500"
                    : isDark ? "bg-primary" : "bg-secondary"
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

      {/* Pied de carte */}
      <div className={`px-5 py-3 border-t ${
        isDark ? "border-surface-3" : "border-gray-100"
      }`}>
        <Button
          type="button"
          onClick={() => onView?.(f)}
          className={[
            "w-full text-sm font-medium py-2 rounded-md transition-colors duration-200",
            isDark
              ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              : "bg-secondary/8 text-secondary hover:bg-secondary/15 border border-secondary/20",
          ].join(" ")}
          aria-label={`${language === "fr" ? "Voir les détails de" : "View details for"} ${title}`}
        >
          {language === "fr" ? "Voir les détails" : "View details"}
        </Button>
      </div>
    </article>
  );
}

export default memo(FormationCardBase);
