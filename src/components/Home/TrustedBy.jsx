import Artvenue from '../Icon/Artvenue';
import { useTheme } from "../../context/ThemeContext";

export default function TrustedBy() {
  const { theme } = useTheme();
  
  return (
    <section className="text-center py-12">
      <h2 className="text-6xl font-extrabold mb-6">Ils nous font confiance</h2>
      <div className="flex flex-wrap justify-center items-center gap-8">
        <img
          src="/home/smartfinder.svg"
          alt="SmartFinder"
          className="h-6"
        />
        <img src="/home/zoomerr.svg" alt="Zoomerr" className="h-6" />
        <img src="/home/shells.svg" alt="SHELLS" className="h-6" />
        <img src="/home/waves.svg" alt="WAVES" className="h-6" />
        <div className="h-6 flex">
          <Artvenue />
        </div>
      </div>
    </section>
  );
}
