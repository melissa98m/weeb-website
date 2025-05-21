import { useTheme } from "../../context/ThemeContext";
export default function ContactForm() {
  const { theme } = useTheme();
  return (
    <section className="px-6 pb-20 flex justify-center">
      <form
        className={`w-full max-w-3xl bg-[#C084FC1A] bg-opacity-25 p-6 rounded-md border text-sm space-y-6 ${
          theme === "dark"
            ? "bg-[#C084FC1A]  border-primary"
            : "bg-light border-secondary"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="nom"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              Nom
            </label>
            <input
              type="text"
              id="nom"
              className={`w-full bg-transparent border-b  focus:outline-none  py-1 ${
                theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              }
              `}
            />
          </div>
          <div>
            <label
              htmlFor="prenom"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              Prénom
            </label>
            <input
              type="text"
              id="prenom"
              className={`w-full bg-transparent border-b  focus:outline-none  py-1 ${
                theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              }
              `}
            />
          </div>
          <div>
            <label
              htmlFor="telephone"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              Téléphone
            </label>
            <input
              type="text"
              id="telephone"
              className={`w-full bg-transparent border-b  focus:outline-none  py-1 ${
                theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              }
              `}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className={`block mb-1 ${
                theme === "dark" ? "text-primary" : "text-secondary"
              }`}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className={`w-full bg-transparent border-b  focus:outline-none  py-1 ${
                theme === "dark"
                  ? "border-primary focus:border-primary"
                  : "border-secondary focus:border-secondary"
              }
              `}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="message"
            className={`block mb-1 ${
              theme === "dark" ? "text-primary" : "text-secondary"
            }`}
          >
            Message
          </label>
          <textarea
            id="message"
            rows="2"
            className={`w-full bg-transparent border-b  focus:outline-none py-1 resize-none ${
              theme === "dark"
                ? "border-primary focus:border-primary"
                : "border-secondary focus:border-secondary"
            }
              `}
          ></textarea>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className={`px-6 py-2 rounded-md shadow hover:brightness-110 transition ${
              theme === "dark" ? "bg-secondary" : "bg-primary"
            }
              `}
          >
            Contact
          </button>
        </div>
      </form>
    </section>
  );
}
