import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="bg-background text-white min-h-screen flex flex-col">
      {/* Navbar spécifique à la page Contact */}
      <header className="bg-[#0f172a] py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6">
          <div className="text-white font-bold text-lg tracking-wide">weeb</div>
          <nav className="text-sm text-white/80">Contact</nav>
          <Link
            to="/login"
            className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition"
          >
            Se connecter
          </Link>
        </div>
      </header>

      {/* Titre + intro */}
      <section className="text-center px-6 py-16 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Votre avis compte !</h1>
        <p className="text-muted text-sm md:text-base">
          Votre retour est essentiel pour nous améliorer ! Partagez votre expérience, dites-nous ce que vous aimez et ce que nous pourrions améliorer...
        </p>
      </section>

      {/* Formulaire */}
      <section className="px-6 pb-20 flex justify-center">
        <form className="w-full max-w-3xl bg-[#1e1b4b] p-6 rounded-md border border-primary text-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nom" className="block mb-1 text-muted">Nom</label>
              <input
                type="text"
                id="nom"
                className="w-full bg-transparent border-b border-muted focus:outline-none focus:border-primary py-1"
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block mb-1 text-muted">Prénom</label>
              <input
                type="text"
                id="prenom"
                className="w-full bg-transparent border-b border-muted focus:outline-none focus:border-primary py-1"
              />
            </div>
            <div>
              <label htmlFor="telephone" className="block mb-1 text-muted">Téléphone</label>
              <input
                type="text"
                id="telephone"
                className="w-full bg-transparent border-b border-muted focus:outline-none focus:border-primary py-1"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 text-muted">Email</label>
              <input
                type="email"
                id="email"
                className="w-full bg-transparent border-b border-muted focus:outline-none focus:border-primary py-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block mb-1 text-muted">Message</label>
            <textarea
              id="message"
              rows="4"
              className="w-full bg-transparent border-b border-muted focus:outline-none focus:border-primary py-1 resize-none"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white px-6 py-2 rounded-md shadow hover:brightness-110 transition"
            >
              Contact
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
