import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import AboutIntro from "../components/About/AboutIntro";
import aboutEn from "../../locales/en/about.json";
import aboutFr from "../../locales/fr/about.json";
import { motion } from "framer-motion";
import { FaAward, FaRocket, FaUsers, FaUniversalAccess } from "react-icons/fa";

export default function About() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = language === "fr" ? aboutFr : aboutEn;

  const cardClass = theme === "dark" 
    ? "bg-[#1c1c1c] border-[#333] text-white" 
    : "bg-white border-gray-200 text-dark";

  const sectionClass = theme === "dark"
    ? "bg-background text-white"
    : "bg-light text-dark";

  const valueCardClass = theme === "dark"
    ? "bg-[#262626] border-[#333] hover:bg-[#2a2a2a]"
    : "bg-gray-50 border-gray-200 hover:bg-gray-100";

  const primaryButtonClass = theme === "dark"
    ? "bg-secondary text-white hover:bg-secondary/70"
    : "bg-primary text-dark hover:bg-primary/70";

  const secondaryButtonClass = theme === "dark"
    ? "border-white text-white hover:bg-white/10"
    : "border-dark text-dark hover:bg-dark/10";

  return (
    <div className={`min-h-screen ${sectionClass}`}>
      <AboutIntro />

      {/* Mission Section */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.6 
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`rounded-xl border shadow-lg p-8 ${cardClass}`}
        >
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`text-3xl font-bold mb-4 ${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            {t.mission_title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base md:text-lg leading-relaxed"
          >
            {t.mission_text}
          </motion.p>
        </motion.div>
      </section>

      {/* Vision Section */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.6,
            delay: 0.1 
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`rounded-xl border shadow-lg p-8 ${cardClass}`}
        >
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-3xl font-bold mb-4 ${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            {t.vision_title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-base md:text-lg leading-relaxed"
          >
            {t.vision_text}
          </motion.p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.6 
          }}
          className={`text-3xl font-bold text-center mb-8 ${
            theme === "dark" ? "text-white" : "text-dark"
          }`}
        >
          {t.values_title}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { key: "quality", title: t.value_quality, desc: t.value_quality_desc, icon: FaAward },
            { key: "innovation", title: t.value_innovation, desc: t.value_innovation_desc, icon: FaRocket },
            { key: "community", title: t.value_community, desc: t.value_community_desc, icon: FaUsers },
            { key: "accessibility", title: t.value_accessibility, desc: t.value_accessibility_desc, icon: FaUniversalAccess },
          ].map((value, index) => {
            const IconComponent = value.icon;
            return (
              <motion.div
                key={value.key}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  type: "spring", 
                  stiffness: 100, 
                  damping: 15,
                  duration: 0.5, 
                  delay: 0.1 + index * 0.1 
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className={`rounded-xl border p-6 text-center cursor-pointer ${valueCardClass}`}
              >
                <div className="flex flex-col items-center gap-4 mb-4">
                  <motion.div 
                    className={`p-3 rounded-lg ${
                      theme === "dark" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"
                    }`}
                    whileHover={{ 
                      rotate: [0, -10, 10, -10, 0],
                      scale: 1.1,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <IconComponent size={24} />
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-primary" : "text-secondary"
                    }`}
                  >
                    {value.title}
                  </motion.h3>
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-sm md:text-base leading-relaxed"
                >
                  {value.desc}
                </motion.p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="px-6 py-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.6 
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`rounded-xl border shadow-lg p-8 text-center ${cardClass}`}
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`text-3xl font-bold mb-4 ${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            {t.team_title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-base md:text-lg leading-relaxed"
          >
            {t.team_text}
          </motion.p>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15,
            duration: 0.6 
          }}
          whileHover={{ scale: 1.02, y: -5 }}
          className={`rounded-xl border shadow-lg p-8 text-center ${cardClass}`}
        >
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`text-3xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-dark"
            }`}
          >
            {t.cta_title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-lg mb-8 ${
              theme === "dark" ? "text-white/80" : "text-dark/80"
            }`}
          >
            {t.cta_text}
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/blog"
                className={`px-6 py-3 rounded-md shadow transition-colors duration-200 ease-in-out focus:outline-none ${primaryButtonClass}`}
              >
                {t.cta_blog}
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/formations"
                className={`px-6 py-3 rounded-md shadow transition-colors duration-200 ease-in-out focus:outline-none ${primaryButtonClass}`}
              >
                {t.cta_formations}
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/contact"
                className={`border px-6 py-3 rounded-md transition-colors duration-200 ease-in-out focus:outline-none ${secondaryButtonClass}`}
              >
                {t.cta_contact}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

