import ContactIntro from "../components/Contact/ContactIntro";
import ContactForm from "../components/Contact/ContactForm";
import { useTheme } from "../context/ThemeContext";

export default function Contact() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col ${
        theme === "dark" ? "bg-background text-white" : "bg-light text-dark"
      }`}
    >
      <ContactIntro />
      <ContactForm />
    </div>
  );
}
