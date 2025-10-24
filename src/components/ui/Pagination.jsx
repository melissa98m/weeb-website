import React from "react";

export default function Pagination({ page, pageCount, onPageChange, theme }) {
  if (pageCount <= 1) return null;

  const baseBtn =
    "min-w-9 h-9 px-3 rounded-md border text-sm flex items-center justify-center";
  const solid =
    theme === "dark"
      ? "bg-secondary text-white border-secondary"
      : "bg-primary text-dark border-primary";
  const ghost =
    theme === "dark"
      ? "bg-[#262626] text-white border-[#333] hover:bg-[#303030]"
      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100";

  const go = (p) => () => {
    if (p >= 1 && p <= pageCount && p !== page) onPageChange(p);
  };

  // liste compacte: 1 … p-1, p, p+1 … last
  const nums = [];
  const push = (n) => nums.push(n);
  const showLeftDots = page > 3;
  const showRightDots = page < pageCount - 2;

  push(1);
  if (showLeftDots) push("…");
  for (let n = Math.max(2, page - 1); n <= Math.min(pageCount - 1, page + 1); n++) {
    if (!nums.includes(n)) push(n);
  }
  if (showRightDots) push("…");
  if (pageCount > 1) push(pageCount);

  return (
    <div className="flex items-center justify-center gap-2 select-none">
      <button
        className={`${baseBtn} ${ghost}`}
        onClick={go(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`dots-${i}`} className="px-2 opacity-70">
            …
          </span>
        ) : (
          <button
            key={n}
            className={`${baseBtn} ${n === page ? solid : ghost}`}
            onClick={go(n)}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </button>
        )
      )}

      <button
        className={`${baseBtn} ${ghost}`}
        onClick={go(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}
