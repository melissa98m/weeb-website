export default function ContactForm() {
  return (
<section className="px-6 pb-20 flex justify-center">
        <form className="w-full max-w-3xl bg-[#C084FC1A] bg-opacity-25 p-6 rounded-md border border-primary text-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nom" className="block mb-1 text-primary">Nom</label>
              <input
                type="text"
                id="nom"
                className="w-full bg-transparent border-b border-primary focus:outline-none focus:border-primary py-1"
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block mb-1 text-primary">Prénom</label>
              <input
                type="text"
                id="prenom"
                className="w-full bg-transparent border-b border-primary focus:outline-none focus:border-primary py-1"
              />
            </div>
            <div>
              <label htmlFor="telephone" className="block mb-1 text-primary">Téléphone</label>
              <input
                type="text"
                id="telephone"
                className="w-full bg-transparent border-b border-primary focus:outline-none focus:border-primary py-1"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 text-primary">Email</label>
              <input
                type="email"
                id="email"
                className="w-full bg-transparent border-b border-primary focus:outline-none focus:border-primary py-1"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block mb-1 text-primary">Message</label>
            <textarea
              id="message"
              rows="2"
              className="w-full bg-transparent border-b border-primary focus:outline-none focus:border-primary py-1 resize-none"
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-secondary text-white px-6 py-2 rounded-md shadow hover:brightness-110 transition"
            >
              Contact
            </button>
          </div>
        </form>
      </section>
  );
}