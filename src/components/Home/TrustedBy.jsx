import Artvenue from "../Icon/Artvenue";
import Shells from "../Icon/Shells";
import Smartfinder from "../Icon/Smartfinder";
import Waves from "../Icon/Waves";
import Zoomerr from "../Icon/Zoomerr";
import { useTheme } from "../../context/ThemeContext";

export default function TrustedBy() {
  const { theme } = useTheme();

  return (
    <section className="text-center py-12">
      <h2 className="text-6xl font-extrabold mb-6">Ils nous font confiance</h2>
      <div className="flex flex-wrap justify-center items-center gap-8">
        <div className="h-6 flex">
          <Smartfinder />
        </div>
        <div className="h-6 flex">
          <Zoomerr />
        </div>
        <div className="h-6 flex">
          <Shells />
        </div>
        <div className="h-6 flex">
          <Waves />
        </div>
        <div className="h-6 flex">
          <Artvenue />
        </div>
      </div>
    </section>
  );
}
