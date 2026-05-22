export default function AdminPageHeader({ title, subtitle, icon: Icon, iconBg, isDark, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            <Icon size={20} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className={`font-display font-extrabold text-2xl leading-tight ${isDark ? "text-white" : "text-dark"}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-sm mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
