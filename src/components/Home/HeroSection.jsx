import { useTheme} from "../../context/ThemeContext"
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { theme } = useTheme();
  return (
    <section className="px-6 py-16 text-center max-w-5xl mx-auto">
      <h1 className="text-7xl md:text-5xl font-bold leading-tight">
        Explorez le <span className={`${theme === 'dark' ? 'text-primary' : 'text-secondary'}`}>Web</span> sous toutes ses 
        <span className={`underline underline-offset-8 ${theme === 'dark' ?  'decoration-primary' : 'decoration-secondary'}`}> facettes</span>
      </h1>
      <p className={`mt-4 max-w-2xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-dark'}`}>
        Le monde du web évolue constamment, et nous sommes là pour vous guider à
        travers ses tendances, technologies et meilleures pratiques. Que vous
        soyez développeur, designer ou passionné du digital, notre blog vous
        offre du contenu de qualité pour rester à la pointe.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
        <button className={`px-6 py-2 rounded-md shadow  ${theme === 'dark' ? 'bg-secondary text-white' : 'bg-primary text-dark'}`}>
          Découvrir les articles
        </button>
        <button className={`border px-6 py-2 rounded-md ${theme === 'dark' ? 'border-white' : 'border-dark'}`}>
          S’abonner à la newsletter
        </button>
      </div>
      <motion.img
        src="/home/mokup.png"
        alt="Mockup"
        className="mt-12 w-full max-w-5xl mx-auto rounded-md"
        style={{
          cursor: 'grab',
        }}
        drag
        dragDirectionLock
        dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        dragElastic={0.5}
        whileTap={{ cursor: 'grabbing' }}
      />
    </section>
  );
}
