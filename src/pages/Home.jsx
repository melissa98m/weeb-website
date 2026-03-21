import { lazy, Suspense, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import HeroSection from "../components/Home/HeroSection";
import LearningSection from "../components/Home/LearningSection";
import TrendsSection from "../components/Home/TrendsSection";
import { setCanonical, setOgMeta, setJsonLd, SITE_URL } from "../lib/seo";

// Lazy load TrustedBy car il contient des composants Icon volumineux non critiques
const TrustedBy = lazy(() => import("../components/Home/TrustedBy"));

export default function Home() {
  const { language } = useLanguage();

  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    document.title = isFr ? "Weeb — Apprendre le développement web" : "Weeb — Learn Web Development";

    const desc = isFr
      ? "Weeb vous accompagne dans votre apprentissage du développement web avec des formations, des articles et des ressources de qualité."
      : "Weeb guides you through your web development journey with quality trainings, articles and resources.";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", desc);

    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) metaRobots.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/`);
    const cleanOgTitle = setOgMeta("og:title", document.title);
    const cleanOgDesc = setOgMeta("og:description", desc);

    const cleanJsonLd = setJsonLd("jsonld-website", {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Weeb",
      url: SITE_URL,
      description: desc,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    });

    return () => {
      document.title = prev;
      cleanCanonical();
      cleanOgUrl();
      cleanOgTitle();
      cleanOgDesc();
      cleanJsonLd();
    };
  }, [language]);

  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="text-center py-12"><div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-6" /></div>}>
        <TrustedBy />
      </Suspense>
      <LearningSection />
      <TrendsSection />
    </>
  );
}
