import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import LegalPage from "../components/LegalPage";
import privacyEn from "../../locales/en/privacy.json";
import privacyFr from "../../locales/fr/privacy.json";
import { setCanonical, setOgMeta, setHreflang, SITE_URL } from "../lib/seo";

export default function Privacy() {
  const { language } = useLanguage();
  const t = language === "fr" ? privacyFr : privacyEn;

  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    const title = isFr ? "Politique de confidentialité | Weeb" : "Privacy Policy | Weeb";
    const desc = isFr
      ? "Découvrez comment Weeb collecte, utilise et protège vos données personnelles conformément au RGPD."
      : "Learn how Weeb collects, uses and protects your personal data in compliance with GDPR.";

    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", desc);
    document.querySelector('meta[name="robots"]')?.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/privacy-policy");
    const cleanHreflang = setHreflang("/privacy-policy");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/privacy-policy`);
    const cleanOgTitle = setOgMeta("og:title", title);
    const cleanOgDesc = setOgMeta("og:description", desc);

    return () => {
      document.title = prev;
      cleanCanonical();
      cleanHreflang();
      cleanOgUrl();
      cleanOgTitle();
      cleanOgDesc();
    };
  }, [language]);

  return <LegalPage content={t} />;
}
