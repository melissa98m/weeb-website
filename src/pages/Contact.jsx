import ContactIntro from "../components/Contact/ContactIntro";
import ContactForm from "../components/Contact/ContactForm";

export default function Contact() {
  return (
    <div className="bg-background text-white min-h-screen flex flex-col">
      <ContactIntro />
      <ContactForm />
    </div>
  );
}

