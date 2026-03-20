import React, { memo } from "react";
import Button from "../../components/Button";

function FormationCardBase({ f, theme, onView }) {
  const title = f?.name || "";
  const excerpt = f?.description || "";

  const cardBase =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#2a2a2a]"
      : "bg-white text-gray-900 border-gray-200";

  const meta =
    theme === "dark" ? "text-white/70" : "text-gray-600";

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-xl border",
        "shadow-sm hover:shadow-lg transition-all duration-200",
        "focus-within:ring-2 focus-within:ring-blue-500/60",
        "outline-none",
        cardBase,
      ].join(" ")}
    >
      {/* Barre d'accent (fine, en haut) */}
      <div
        className={
          theme === "dark"
            ? "h-1 bg-gradient-to-r from-secondary/80 via-secondary/50 to-transparent"
            : "h-1 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent"
        }
      />

      <div className="p-4">
        {/* Titre */}
        <h2 className="text-base md:text-lg font-semibold tracking-tight mb-1 line-clamp-2">
          {title}
        </h2>

        {/* Description */}
        {excerpt ? (
          <p className={`text-sm leading-relaxed line-clamp-3 ${meta}`}>
            {excerpt}
          </p>
        ) : (
          <p className={`text-sm italic ${meta}`}>—</p>
        )}

        {/* Barre de progression (si l'utilisateur est inscrit et que des modules existent) */}
        {typeof f.progress_percent === "number" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={meta}>Progression</span>
              <span className={`font-medium ${f.progress_percent === 100 ? "text-green-500" : meta}`}>
                {f.progress_percent}%
              </span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-gray-100"}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  f.progress_percent === 100 ? "bg-green-500" : "bg-indigo-500"
                }`}
                style={{ width: `${f.progress_percent}%` }}
                role="progressbar"
                aria-valuenow={f.progress_percent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-end">
          <Button
            type="button"
            onClick={() => onView?.(f)}
            className={[
              "px-3 py-1.5 rounded-md text-sm shadow",
              "transition-transform duration-200",
              "group-hover:translate-y-[-1px] hover:brightness-110",
              theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark",
            ].join(" ")}
            aria-label="Voir les détails de la formation"
          >
            Voir les détails
          </Button>
        </div>
      </div>

      {/* Halo subtil au survol */}
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-xl",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          theme === "dark" ? "ring-1 ring-secondary/20" : "ring-1 ring-primary/20",
        ].join(" ")}
      />
    </article>
  );
}

export default memo(FormationCardBase);
