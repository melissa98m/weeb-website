import { lazy, Suspense, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import HeroSection from "../components/Home/HeroSection";
import MarqueeSection from "../components/Home/MarqueeSection";
import BentoGrid from "../components/Home/BentoGrid";
import StepsSection from "../components/Home/StepsSection";
import CtaFinal from "../components/Home/CtaFinal";
import { setCanonical, setOgMeta, setJsonLd, setHreflang, setTwitterMeta, SITE_URL, DEFAULT_OG_IMAGE } from "../lib/seo";

// Lazy — below the fold, not critical for LCP
const FeaturedArticle = lazy(() => import("../components/Home/FeaturedArticle"));

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
    const cleanOgImg = setOgMeta("og:image", DEFAULT_OG_IMAGE);
    const cleanTwTitle = setTwitterMeta("twitter:title", document.title);
    const cleanTwDesc = setTwitterMeta("twitter:description", desc);
    const cleanTwImg = setTwitterMeta("twitter:image", DEFAULT_OG_IMAGE);
    const cleanHreflang = setHreflang("/");

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
      cleanHreflang();
      cleanOgUrl();
      cleanOgTitle();
      cleanOgDesc();
      cleanOgImg();
      cleanTwTitle();
      cleanTwDesc();
      cleanTwImg();
      cleanJsonLd();
    };
  }, [language]);

  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <BentoGrid />
      <StepsSection />
      <Suspense fallback={null}>
        <FeaturedArticle />
      </Suspense>
      <CtaFinal />
    </>
  );
}
