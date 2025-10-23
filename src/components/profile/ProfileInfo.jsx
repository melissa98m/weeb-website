import React from "react";

export default function ProfileInfo({ user, t, theme, onRefresh, onSignout }) {
    console.log(user)
  const card =
    theme === "dark"
      ? "bg-[#1c1c1c] text-white border-[#333]"
      : "bg-white text-gray-900 border-gray-200";

  return (
    <section className={`w-full max-w-2xl rounded-xl border shadow ${card} p-6`}>
      <h1 className="text-2xl font-semibold mb-6">{t.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm opacity-70">{t.username}</div>
          <div className="text-base font-medium break-all">{user.username || "—"}</div>
        </div>

        <div>
          <div className="text-sm opacity-70">{t.email}</div>
          <div className="text-base font-medium break-all">{user.email || "—"}</div>
        </div>

        <div>
          <div className="text-sm opacity-70">{t.firstName}</div>
          <div className="text-base font-medium">{user.first_name || "—"}</div>
        </div>

        <div>
          <div className="text-sm opacity-70">{t.lastName}</div>
          <div className="text-base font-medium">{user.last_name || "—"}</div>
        </div>
      </div>

    </section>
  );
}
