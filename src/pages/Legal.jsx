import { useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import LegalPage from "../components/LegalPage";
import legalEn from "../../locales/en/legal.json";
import legalFr from "../../locales/fr/legal.json";
import { setCanonical, setOgMeta, setHreflang, SITE_URL } from "../lib/seo";

export default function Legal() {
  const { language } = useLanguage();
  const t = language === "fr" ? legalFr : legalEn;

  useEffect(() => {
    const prev = document.title;
    const isFr = language === "fr";
    const title = isFr ? "Mentions légales | Weeb" : "Legal Notice | Weeb";
    const desc = isFr
      ? "Mentions légales du site Weeb : éditeur, hébergeur, propriété intellectuelle et conditions d'utilisation."
      : "Legal notice for Weeb: publisher, host, intellectual property and terms of use.";

    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", desc);
    document.querySelector('meta[name="robots"]')?.setAttribute("content", "index, follow");

    const cleanCanonical = setCanonical("/legal-notices");
    const cleanHreflang = setHreflang("/legal-notices");
    const cleanOgUrl = setOgMeta("og:url", `${SITE_URL}/legal-notices`);
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
