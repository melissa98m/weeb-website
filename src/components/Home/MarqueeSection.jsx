import { useTheme } from "../../context/ThemeContext";
import { useReducedMotion } from "framer-motion";

const KEYWORDS = [
  "React", "TypeScript", "Next.js", "CSS", "Node.js", "Git",
  "Vue.js", "Tailwind", "REST API", "GraphQL", "Accessibility",
  "Docker", "CI/CD", "PostgreSQL", "JavaScript", "Web Perf",
];

const SEPARATOR = "·";

// Duplicate the list so the marquee loops seamlessly
const TRACK = [...KEYWORDS, ...KEYWORDS];

export default function MarqueeSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();

  const trackStyle = prefersReducedMotion
    ? {}
    : {
        animation: "marquee 28s linear infinite",
        willChange: "transform",
      };

  return (
    <section
      aria-hidden="true"
      className="overflow-hidden py-10 select-none"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="flex items-center gap-8 w-max"
        style={trackStyle}
      >
        {TRACK.map((word, idx) => (
          <span
            key={idx}
            className={`text-sm font-medium tracking-wide whitespace-nowrap ${
              idx % (KEYWORDS.length * 2) === 0
                ? isDark ? "text-white/20" : "text-dark/20"
                : isDark ? "text-white/20" : "text-dark/20"
            }`}
          >
            {word}
            <span className="ml-8 opacity-40">{SEPARATOR}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
