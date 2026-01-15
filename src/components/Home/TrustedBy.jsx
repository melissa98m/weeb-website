import { lazy, Suspense } from "react";
import { useTheme } from "../../context/ThemeContext";
import homeEn from "../../../locales/en/home.json";
import homeFr from "../../../locales/fr/home.json";
import { useLanguage } from "../../context/LanguageContext";

// Lazy load des composants Icon volumineux pour ne pas bloquer le chargement initial
const Artvenue = lazy(() => import("../Icon/Artvenue"));
const Shells = lazy(() => import("../Icon/Shells"));
const Smartfinder = lazy(() => import("../Icon/Smartfinder"));
const Waves = lazy(() => import("../Icon/Waves"));
const Zoomerr = lazy(() => import("../Icon/Zoomerr"));

// Composant de fallback minimal
function IconPlaceholder() {
  return <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />;
}

export default function TrustedBy() {
  const { theme } = useTheme();
  const { language } = useLanguage();

  return (
    <section className="text-center py-12">
      <h2 className="text-6xl font-extrabold mb-6">
        {language === "fr" ? homeFr.trust : homeEn.trust}
      </h2>
      <div className="flex flex-wrap justify-center items-center gap-8">
        <Suspense fallback={<IconPlaceholder />}>
          <div className="h-6 flex">
            <Smartfinder />
          </div>
        </Suspense>
        <Suspense fallback={<IconPlaceholder />}>
          <div className="h-6 flex">
            <Zoomerr />
          </div>
        </Suspense>
        <Suspense fallback={<IconPlaceholder />}>
          <div className="h-6 flex">
            <Shells />
          </div>
        </Suspense>
        <Suspense fallback={<IconPlaceholder />}>
          <div className="h-6 flex">
            <Waves />
          </div>
        </Suspense>
        <Suspense fallback={<IconPlaceholder />}>
          <div className="h-6 flex">
            <Artvenue />
          </div>
        </Suspense>
      </div>
    </section>
  );
}
