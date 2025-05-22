import contactEn from "../../../locales/en/contact.json";
import contactFr from "../../../locales/fr/contact.json";
import { useLanguage } from "../../context/LanguageContext";

export default function ContactIntro() {
  const { language } = useLanguage();
  return (
    <section className="text-center px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-7xl md:text-4xl font-bold mb-4">
        {language === "fr" ? contactFr.contact_title : contactEn.contact_title}
      </h1>
      <p className="text-sm md:text-base">
        {language === "fr" ? contactFr.contact_intro : contactEn.contact_intro}
      </p>
    </section>
  );
}
