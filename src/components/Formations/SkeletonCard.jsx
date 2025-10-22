import React from "react";

export default function SkeletonCard({ theme }) {
  const card = theme === "dark" ? "bg-[#1c1c1c] border-[#333]" : "bg-white border-gray-200";
  return (
    <div className={`rounded-xl border shadow p-4 ${card} animate-pulse`}>
      <div className="h-40 w-full rounded-lg mb-4 bg-gray-300/30" />
      <div className="h-4 w-3/4 rounded bg-gray-300/30 mb-2" />
      <div className="h-3 w-2/3 rounded bg-gray-300/30 mb-4" />
      <div className="flex gap-2">
        <div className="h-6 w-16 rounded-full bg-gray-300/30" />
        <div className="h-6 w-12 rounded-full bg-gray-300/30" />
      </div>
    </div>
  );
}