import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion, useReducedMotion } from "framer-motion";
import Button from "../Button";

export default function CtaFinal() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === "dark";
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="px-6 py-24 max-w-6xl mx-auto"
      aria-label={language === "fr" ? "Commencer maintenant" : "Get started now"}
    >
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl px-8 py-16 md:py-20 text-center"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(192,132,252,0.08) 0%, rgba(147,51,234,0.12) 100%)"
            : "linear-gradient(135deg, rgba(192,132,252,0.07) 0%, rgba(147,51,234,0.10) 100%)",
          border: isDark ? "1px solid rgba(192,132,252,0.15)" : "1px solid rgba(147,51,234,0.12)",
        }}
      >
        {/* Decorative glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(192,132,252,0.10), transparent)"
              : "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(147,51,234,0.06), transparent)",
          }}
        />

        <div className="relative">
          <h2
            className={`font-display font-extrabold tracking-tight ${isDark ? "text-white" : "text-dark"}`}
            style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
          >
            {language === "fr"
              ? "Prêt à maîtriser le développement web ?"
              : "Ready to master web development?"}
          </h2>

          <p className={`mt-4 text-base max-w-md mx-auto ${isDark ? "text-white/55" : "text-dark/55"}`}>
            {language === "fr"
              ? "Rejoignez des milliers d'apprenants et commencez gratuitement aujourd'hui."
              : "Join thousands of learners and start for free today."}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button variant="primary" size="lg" to="/register">
              {language === "fr" ? "Créer un compte" : "Create an account"}
            </Button>
            <Button variant="ghost" size="lg" isDark={isDark} to="/blog">
              {language === "fr" ? "Explorer le contenu" : "Explore content"}
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
