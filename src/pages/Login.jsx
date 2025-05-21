import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";

export default function Login() {
  const { theme } = useTheme();
  return (
    <section
      className={`min-h-screen  flex items-center justify-center px-6 py-12 ${
        theme === "dark"
          ? "bg-background text-white"
          : "bg-muted text-background"
      }`}
    >
      <div className="w-full max-w-sm  p-8  space-y-6">
        <h1 className="text-3xl font-bold text-center">Se connecter</h1>

        {/* Email */}
        <div className="relative">
          <input
            type="email"
            id="email"
            placeholder=" "
            className={`peer w-full bg-transparent border-b-2 placeholder-transparent focus:outline-none py-2 ${
              theme === "dark"
                ? "border-primary text-primary  focus:border-primary"
                : "border-secondary text-secondary  focus:border-secondary"
            }`}
          />
          <label
            htmlFor="email"
            className={`absolute left-0 top-2 text-sm transition-all peer-placeholder-shown:top-2 peer-focus:top-[-1rem] ${
              theme === "dark"
                ? "text-primary  peer-focus:text-primary"
                : "text-secondary  peer-focus:text-secondary"
            }`}
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
            className={`peer w-full bg-transparent border-b-2 placeholder-transparent focus:outline-none py-2 ${
              theme === "dark"
                ? "border-primary text-primary  focus:border-primary"
                : "border-secondary text-secondary  focus:border-secondary"
            }`}
          />
          <label
            htmlFor="password"
            className={`absolute left-0 top-2 text-sm transition-all peer-placeholder-shown:top-2 peer-focus:top-[-1rem] ${
              theme === "dark"
                ? "text-primary  peer-focus:text-primary"
                : "text-secondary  peer-focus:text-secondary"
            }`}
          >
            Password
          </label>
        </div>

        {/* Se connecter */}
        <motion.button
          type="submit"
          className={`w-full text-sm px-4 py-2 rounded-md shadow hover:brightness-110 transition  ${
            theme === "dark" ? "bg-secondary" : "bg-primary"
          }`}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          Se connecter
        </motion.button>

        {/* Liens */}
        <div className="text-center text-xs space-y-2">
          <Link
            to="/forgot-password"
            className={`${
              theme === "dark" ? "hover:text-primary" : "hover:text-secondary"
            }`}
          >
            Mot de passe oublié ?
          </Link>
          <p
            className={`${
              theme === "dark" ? "text-muted" : "text-background/80"
            }`}
          >
            Vous n’avez pas de compte ? Vous pouvez vous en{" "}
            <Link
              to="/register"
              className={`font-medium underline underline-offset-8 ${
                theme === "dark"
                  ? "text-white hover:text-primary"
                  : "text-background hover:text-secondary"
              }`}
            >
              créer un
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
