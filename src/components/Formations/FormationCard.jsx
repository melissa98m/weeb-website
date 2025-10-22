import React, { memo } from "react";
import Button from "../../components/Button";

function FormationCardBase({ f, theme, onView }) {
  const title = f?.name || "";
  const excerpt = f?.description || "";

  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";
  const meta = theme === "dark" ? "text-white/70" : "text-gray-600";

  return (
    <article className={`rounded-xl border shadow ${card}`}>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 line-clamp-2">{title}</h3>
        {excerpt && (
          <p className={`text-sm mb-4 line-clamp-3 ${meta}`}>{excerpt}</p>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => onView?.(f)}
            className={`px-3 py-1.5 rounded-md shadow text-sm hover:brightness-110 ${
              theme === "dark" ? "bg-secondary text-white" : "bg-primary text-dark"
            }`}
          >
            Voir les détails
          </Button>
        </div>
      </div>
    </article>
  );
}

export default memo(FormationCardBase);
