import { Link } from "react-router-dom";

export default function Login() {
  return (
    <section className="min-h-screen bg-background text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm  p-8  space-y-6">
        <h1 className="text-3xl font-bold text-center">Se connecter</h1>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
            placeholder=" "
            className="peer w-full bg-transparent border-b-2 border-primary text-primary placeholder-transparent focus:outline-none focus:border-primary py-2"
          />
          <label
            htmlFor="email"
            className="absolute left-0 top-2 text-primary text-sm transition-all peer-placeholder-shown:top-2 peer-focus:top-[-1rem] peer-focus:text-primary"
          >
            Email
          </label>
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type="password"
            id="password"
            placeholder=" "
            className="peer w-full bg-transparent border-b-2 border-primary text-primary placeholder-transparent focus:outline-none focus:border-primary py-2"
          />
          <label
            htmlFor="password"
            className="absolute left-0 top-2 text- text-sm transition-all  text-primary peer-placeholder-shown:top-2 peer-focus:top-[-1rem] peer-focus:text-primary"
          >
            Password
          </label>
        </div>

        {/* Se connecter */}
        <button
          type="submit"
          className="w-full bg-secondary text-white text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition"
        >
          Se connecter
        </button>

        {/* Liens */}
        <div className="text-center text-xs space-y-2">
          <Link to="/forgot-password" className="text-white hover:text-primary">
            Mot de passe oublié ?
          </Link>
          <p className="text-muted">
            Vous n’avez pas de compte ?{" "}
            <Link to="/register" className="text-white font-medium hover:text-primary underline underline-offset-8">
              Créer un
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
